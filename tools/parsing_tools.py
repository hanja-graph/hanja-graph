#!/usr/bin/env python3

# Standard library
from typing import Dict, List, Set, Optional
from dataclasses import dataclass

# pip
import regex

class HanjaCharacterEntry:
    def __init__(self):
        self.english_meanings = set()
        self.korean_meanings = set()
        self.glosses = set()
    english_meanings: Set[str]
    korean_meanings: Set[str]
    glosses: Set[str]

@dataclass
class KoreanWord:
    korean_word: str
    english_meanings: Set[str]
    glosses: Set[str]
    hanja: Optional[str]
    part_of_speech: str

def is_hangul(value: str):
    if regex.search(r'\p{IsHangul}', value.replace(" ", "")):
        return True
    return False

def add_hanja_character(hanja_characters: Dict[str, Dict[str, HanjaCharacterEntry]], hanja_word: str, hangul_pronunciations: List[str], glosses: List[str], korean_meanings: List[str], english_meanings: List[str]):
    if hanja_word not in hanja_characters:
        hanja_characters[hanja_word] = {}
    for hangul_pronunciation in set(hangul_pronunciations):
        if hangul_pronunciation not in hanja_characters[hanja_word]:
            hanja_characters[hanja_word][hangul_pronunciation] = HanjaCharacterEntry()
        hanja_characters[hanja_word][hangul_pronunciation].english_meanings.update(english_meanings)
        hanja_characters[hanja_word][hangul_pronunciation].korean_meanings.update(korean_meanings)
        hanja_characters[hanja_word][hangul_pronunciation].korean_meanings.update(glosses)

def sanitize(input_string: str):
    return input_string.replace("'","''")

def build_hanja_english_definition_file(file_path: str, hanja_characters: Dict[str, Dict[str, HanjaCharacterEntry]]):
    with open(file_path, "w") as f:
        f.write("INSERT INTO `english_hanja_definition` VALUES\n");
        lines = []
        for hanja in hanja_characters:
            if len(hanja) != 1:
                continue
            for hangul in hanja_characters[hanja]:
                if len(hangul) != 1:
                    continue
                if not is_hangul(hangul):
                    continue
                if len(hanja_characters[hanja][hangul].english_meanings) > 0:
                    for english_meaning in hanja_characters[hanja][hangul].english_meanings:
                        sanitized_english_meaning = sanitize(english_meaning)
                        lines.append(f"('{hanja}', '{sanitized_english_meaning}')");
                elif len(hanja_characters[hanja][hangul].glosses) > 0:
                    for gloss in hanja_characters[hanja][hangul].glosses:
                        sanitized_gloss = sanitize(gloss)
                        lines.append(f"('{hanja}', '{sanitized_gloss}')");
        f.write(',\n'.join(lines))
        f.write('\nON CONFLICT DO NOTHING;')

def build_korean_pronunciation_file(file_path: str, hanja_characters: Dict[str, Dict[str, HanjaCharacterEntry]]):
    with open(file_path, "w") as f:
        f.write("INSERT INTO `korean_pronunciation` VALUES\n");
        lines = []
        for hanja in hanja_characters:
            if len(hanja) != 1:
                continue
            for hangul in hanja_characters[hanja]:
                if len(hangul) != 1:
                    continue
                if not is_hangul(hangul):
                    continue
                lines.append(f"('{hanja}', '{hangul}')");
        f.write(',\n'.join(lines))
        f.write('\nON CONFLICT DO NOTHING;')

def build_hanja_korean_definition_file(file_path: str, hanja_characters: Dict[str, Dict[str, HanjaCharacterEntry]]):
    with open(file_path, "w") as f:
        f.write("INSERT INTO `korean_hanja_definition` VALUES\n");
        lines = []
        for hanja in hanja_characters:
            if len(hanja) != 1:
                print("Warning: Hanja did not have size 1: '" + hanja + "'")
                continue
            for hangul in hanja_characters[hanja]:
                if len(hanja_characters[hanja][hangul].korean_meanings) > 0:
                    for korean_meaning in hanja_characters[hanja][hangul].korean_meanings:
                        lines.append(f"('{hanja}', '{sanitize(korean_meaning)}')");
                else:
                    print(f"Warning: no english meanings or glosses for {hanja},{hangul}")
                    continue
        f.write(',\n'.join(lines))
        f.write('\nON CONFLICT DO NOTHING;')

def build_word_list(file_path: str, word_lists: List[Dict[Optional[str], Dict[str, KoreanWord]]]):
    with open(file_path, "w") as f:
        f.write("INSERT INTO `word_list` VALUES\n");
        lines = []
        for word_list in word_lists:
            for hanja in word_list:
                for hangul in word_list[hanja]:
                    if len(word_list[hanja][hangul].english_meanings) > 0:
                        for english_meaning in word_list[hanja][hangul].english_meanings:
                            sanitized_english_meaning = sanitize(english_meaning)
                            if hanja is not None and len(hanja) != len(hangul):
                                print(f"warning, not processing, hanja='{hanja}', hangul='{hangul}'")
                                continue
                            if hanja is None:
                                lines.append(f"(NULL, '{hangul}', '{sanitized_english_meaning}', '{word_list[hanja][hangul].part_of_speech}')");
                            else:
                                lines.append(f"('{hanja}', '{hangul}', '{sanitized_english_meaning}', '{word_list[hanja][hangul].part_of_speech}')");
                    elif len(word_list[hanja][hangul].glosses) > 0:
                        for gloss in word_list[hanja][hangul].glosses:
                            sanitized_gloss = sanitize(gloss)
                            if hanja is not None and len(hanja) != len(hangul):
                                print(f"warning, not processing, hanja='{hanja}', hangul='{hangul}'")
                                continue
                            if hanja is None:
                                lines.append(f"(NULL, '{hangul}', '{sanitized_gloss}', '{word_list[hanja][hangul].part_of_speech}')");
                            else:
                                lines.append(f"('{hanja}', '{hangul}', '{sanitized_gloss}', '{word_list[hanja][hangul].part_of_speech}')");
                    else:
                        continue
        f.write(',\n'.join(lines))
        f.write('\nON CONFLICT DO NOTHING;')


def add_spaces_to_hanja(hanja: Optional[str], hangul: str):
    if hanja is None:
        return hanja
    #  For cases like this:
    # 歸還不能地點']
    # 귀환 불능 지점
    new_hanja = ""
    i = 0
    for char in hangul:
        if char != ' ' and i < len(hanja):
            new_hanja += hanja[i]
            i += 1
        else:
            new_hanja += ' '
    return new_hanja

def upsert_korean_word(word_dict: Dict[Optional[str], Dict[str,KoreanWord]], hanja_word: Optional[str], hangul_word: str, english_meanings: List[str], glosses: List[str], part_of_speech: str):
    hanja_words_to_add = []
    if hanja_word is None:
        hanja_words_to_add = [None]
    else:
        hanja_words_to_add = [hanja_word]
        if len(hanja_word.split('／')) > 0:
                hanja_words_to_add = hanja_word.split('／')

    hanja_words_to_add = [add_spaces_to_hanja(w, hangul_word) for w in hanja_words_to_add]
    for hanja_word_i in hanja_words_to_add:
        if hanja_word_i in word_dict:
            if hanja_word_i is not None and len(hanja_word_i) != len(hangul_word):
                print(f"Warning: could not process hanja {hanja_word_i}")
                continue
            if hangul_word in word_dict[hanja_word_i]:
                word_dict[hanja_word_i][hangul_word].english_meanings.update(english_meanings)
                word_dict[hanja_word_i][hangul_word].glosses.update(glosses)
            else:
                word_dict[hanja_word_i][hangul_word] = KoreanWord(hangul_word, set(english_meanings), set(glosses), hanja_word_i, part_of_speech)
        else:
            word_dict[hanja_word_i] = {}
            word_dict[hanja_word_i][hangul_word] = KoreanWord(hangul_word, set(english_meanings), set(glosses), hanja_word_i, part_of_speech)

def strip_common_verb_suffixes(word: str):
    if word.endswith('하다'):
        return word[0:len(word)-2]
    if word.endswith('되다'):
        return word[0:len(word)-2]
    if word.endswith('보다'):
        return word[0:len(word)-2]
    if word.endswith('나다'):
        return word[0:len(word)-2]
    if word.endswith('치다'):
        return word[0:len(word)-2]
    if word.endswith('뜨다'):
        return word[0:len(word)-2]
    if word.endswith('막히다'):
        return word[0:len(word)-3]
    if word.endswith('잇다'):
        return word[0:len(word)-2]
    if word.endswith('을 먹다'):
        return word[0:len(word)-4]
    if word.endswith('쓰다'):
        return word[0:len(word)-2]
    if word.endswith(' '):
        return word.rstrip()
    if word.endswith('—'):
        return word[0:len(word)-1]
    if word.endswith('히'):
        return word[0:len(word)-1]
    if word.endswith('로'):
        return word[0:len(word)-1]
    return word
                            
def dict_contains_hangul_word(word_dict: Dict[Optional[str], Dict[str,KoreanWord]], hangul_word: str):
    stripped_hangul_word = strip_common_verb_suffixes(hangul_word)
    for hanja in word_dict:
        for hangul in word_dict[hanja]:
            if stripped_hangul_word == hangul or hangul_word == hangul:
                return True
    return False
