#!/usr/bin/env python3

# A script for parsing all Korean words out of a Wiktionary dump.
# Exhaustive list of head templates as of this writing:
#ko-hanja/new - Hanja. Used.
#ko-hanja - Hanja. Used.
#head - seems like all words have this. Not parsed.
#ko-noun - Korean nouns. Used.
#ko-pos - particles, etc. Complex concepts and not appropriate for flash cards.
#ko-hanja/old - Korean nouns. Used.
#ko-proper noun - proper Korean nouns, used.
#ko-interj - interjections. Not suitable for flash cards.
#ko-syllable-hanja - Hangul characters. Not in scope.
#ko-interjection - more interjections
#ko-syllable - Hangul again
#ko-adv - adverbs, used.
#ko-determ - determiners, used.
#ko-adj - adjectives, used.
#ko-verb verbs, used.
#ko-verb-set - more verbs
#ko-verb-form - not pure infinitive, not using.
#ko-adj-form - not pure infinitive, not using
#ko-suffix - grammatical suffixes, not using.
#ko-root - various word roots, not useful.
#ko-num, numerical words, used.
#ko-adverb
#ko-det
#ko-adjective
#ko-proverb
#ko-prop
#ko-conj/adj

# Standard library
from typing import Dict, List, Set, Optional
import argparse
import os
import json
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

def word_reader(file_name: str):
    for row in open(file_name, "r"):
        blob = json.loads(row)
        yield blob

def is_hangul(value: str):
    if regex.search(r'\p{IsHangul}', value.replace(" ", "")):
        return True
    return False

def english_meanings_from_links(links: List[str]):
    return [link[0] for link in links if link[0].replace(" ", "").isalpha() and link[1].replace(" ","").isalpha()]

def english_meanings_from_word(word: Dict):
    if "senses" not in word:
        return []
    senses = word['senses']
    english_meanings = []
    for sense in senses:
        if "links" in sense:
            links: List[str] = sense["links"]
            english_meanings += english_meanings_from_links(links)
    return english_meanings

def korean_meanings_from_word(word: Dict):
    if "senses" not in word:
        return []
    senses = word['senses']
    korean_meanings = []
    for sense in senses:
        if "links" in sense:
            links: List[str] = sense["links"]
            korean_meanings += english_meanings_from_links(links)
            for link in links:
                if link[1].endswith('#Korean'):
                    if is_hangul(link[0]):
                        korean_meanings.append(link[0])
    return korean_meanings

def glosses_from_word(word: Dict):
    if "senses" not in word:
        return []
    senses = word['senses']
    glosses = []
    for sense in senses:
        if "glosses" in sense:
            glosses += sense['glosses']
    return glosses

def add_hanja_character(hanja_characters: Dict[str, Dict[str, HanjaCharacterEntry]], hanja_word: str, hangul_pronunciations: List[str], glosses: List[str], korean_meanings: List[str]):
    if hanja_word not in hanja_characters:
        hanja_characters[hanja_word] = {}
    for hangul_pronunciation in set(hangul_pronunciations):
        if hangul_pronunciation not in hanja_characters[hanja_word]:
            hanja_characters[hanja_word][hangul_pronunciation] = HanjaCharacterEntry()
        hanja_characters[hanja_word][hangul_pronunciation].english_meanings.update(english_meanings)
        hanja_characters[hanja_word][hangul_pronunciation].korean_meanings.update(korean_meanings)
        hanja_characters[hanja_word][hangul_pronunciation].korean_meanings.update(glosses)
                                
def upsert_korean_word(word_dict: Dict[Optional[str], Dict[str,KoreanWord]], hanja_word: Optional[str], hangul_word: str, english_meanings: List[str], glosses: List[str]):
    if hanja_word in word_dict:
        if hangul_word in word_dict[hanja_word]:
            word_dict[hanja_word][hangul_word].english_meanings.update(english_meanings)
            word_dict[hanja_word][hangul_word].glosses.update(glosses)
        else:
            word_dict[hanja_word][hangul_word] = KoreanWord(hangul_word, set(english_meanings), set(glosses), hanja_word)
    else:
        word_dict[hanja_word] = {}
        word_dict[hanja_word][hangul_word] = KoreanWord(hangul_word, set(english_meanings), set(glosses), hanja_word)

def strip_common_verb_suffixes(word: str):
    if word.endswith('하다'):
        return True, word[0:len(word)-2]
    if word.endswith('되다'):
        return True, word[0:len(word)-2]
    if word.endswith('보다'):
        return True, word[0:len(word)-2]
    if word.endswith('나다'):
        return True, word[0:len(word)-2]
    if word.endswith('치다'):
        return True, word[0:len(word)-2]
    if word.endswith('뜨다'):
        return True, word[0:len(word)-2]
    if word.endswith('막히다'):
        return True, word[0:len(word)-3]
    if word.endswith('잇다'):
        return True, word[0:len(word)-2]
    if word.endswith('을 먹다'):
        return True, word[0:len(word)-4]
    if word.endswith('쓰다'):
        return True, word[0:len(word)-2]
    if word.endswith(' '):
        return True, word.rstrip()
    if word.endswith('—'):
        return True, word[0:len(word)-1]
    if word.endswith('히'):
        return True, word[0:len(word)-1]
    if word.endswith('로'):
        return True, word[0:len(word)-1]
    return False, word

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                    prog='build_dictionary',
                    description='Builds SQL files from Wiktionary data dumps.')
    parser.add_argument('in_filename', help="A file containing a Wiktionary data dump, for example downloaded from https://kaikki.org/dictionary/Korean/index.html")
    parser.add_argument('out_directory', help="A directory (to be created if it does not exist) to which to write the SQL files that hanja-graph can use.")
    parser.add_argument('-ht', '--head-templates', action='store_true', help="Extract and show head templates?")
    args = parser.parse_args()

    in_filename: str = args.in_filename
    out_directory: str = args.out_directory
    show_head_templates: bool = args.head_templates

    print(f"Reading from {in_filename}, writing to {out_directory}")
    os.makedirs(out_directory, exist_ok=True)

    print(f"Validating filename by reading it before beginning.")
    count = 0
    for word in word_reader(in_filename):
        count += 1
    print(f"Parsed all {count} lines of {in_filename} as JSON.")

    if show_head_templates:
        print("Extracting all distinct head templates for inspection.")
        distinct_head_templates: Set[str] = set()
        for word in word_reader(in_filename):
            if "head_templates" in word:
                head_templates: List[Dict] = word["head_templates"]
                for head_template in head_templates:
                    head_template_name = head_template["name"]
                    if head_template_name not in distinct_head_templates:
                        distinct_head_templates.add(head_template_name)
                        print(f"Head template {head_template_name}")
    
    # By showing the head templates, we can determine that words with the following
    # head templates represent Hanja:
    # ko-hanja/new
    # ko-hanja
    # ko-hanja/old
    hanja_characters: Dict[str, Dict[str, HanjaCharacterEntry]] = {}
    print(f"Parsing Hanja pronunciations and meanings out of words with hanja/new head template.")
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-hanja/old", "ko-hanja/new", "ko-hanja"):
                    # keys: 'pos', 'head_templates', 'forms', 'word', 'lang', 'lang_code', 'senses'
                    hanja_word: str = word["word"]
                    if "senses" not in word:
                        continue
                    senses: List[Dict] = word["senses"]
                    for sense in senses:
                        # Links appear to be loosely schematized like this:
                        # [['Hanja', 'hanja#English'], ['견', '견#Korean'], ['dog', 'dog']]
                        if "args" not in head_template:
                            continue
                        head_template_args: Dict = head_template["args"]
                        hangul_pronunciations = []
                        english_meanings = []
                        glosses = []
                        if "links" in sense:
                            links: List[str] = sense["links"]
                            english_meanings += english_meanings_from_links(links)
                            hangul_pronunciations += [link[0] for link in links if link[1][1:] == '#Korean' and link[0] != hanja_word and is_hangul(link[0])]
                        korean_meanings = [head_template_args[key] for key in head_template_args if len(head_template_args[key]) > 0]
                        hangul_pronunciations += [meaning for meaning in korean_meanings if len(meaning) == 1]

                        if "glosses" in sense:
                            glosses += sense["glosses"]
                        
                        if len(hangul_pronunciations) == 0:
                            continue
                        if len(korean_meanings) == 0:
                            continue
                        add_hanja_character(hanja_characters, hanja_word, hangul_pronunciations, glosses, korean_meanings)
    print(f"Acquired {len(hanja_characters)} unique hanja characters.")

    print(f"Parsing explicit Sino-Korean nouns.")
    sino_korean_nouns: Dict[Optional[str], Dict[str, KoreanWord]] = {}
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-noun"):
                    focus_word = word["word"]
                    if is_hangul(focus_word):
                        pass
                    elif focus_word.replace(" ","").isalpha() and focus_word.replace(" ","").isascii():
                        pass
                    else:
                        glosses = []
                        english_meanings = []
                        hangul_pronunciations = []
                        hanja_word = focus_word
                        if "args" in head_template:
                            head_template_args: Dict = head_template["args"]
                            if 'hangul' in head_template_args:
                                hangul_pronunciations.append(head_template_args["hangeul"])
                        if "forms" in word:
                            forms: List[Dict] = word["forms"]
                            for form in forms:
                                if 'hangeul' in form['tags'] and 'form' in form:
                                    hangul_pronunciations.append(form['form'])
                        if 'senses' in word:
                            senses = word['senses']
                            for sense in senses:
                                if 'links' in sense:
                                    links = sense['links']
                                    english_meanings += english_meanings_from_links(links)
                                    hangul_pronunciations += [link[0] for link in links if is_hangul(link[1].replace('#Korean', ""))]
                                if len(set(hangul_pronunciations)) < 1:
                                    print("got less than 1 hangul pronunciation")
                                    print(hangul_pronunciations)
                                    continue
                                if 'glosses' in sense:
                                    glosses += sense['glosses']
                                upsert_korean_word(sino_korean_nouns, hanja_word, hangul_pronunciations[0], english_meanings, glosses)
    print(f"Acquired {len(sino_korean_nouns)} unique Hanja-based Korean words.")

    print(f"Parsing Sino-Korean nouns.")
    n_new_characters = 0
    n_new_sino_korean_nouns = 0
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-noun", "ko-proper noun", "ko-num"):
                    focus_word = word["word"]
                    if is_hangul(focus_word):
                        glosses = []
                        english_meanings = []
                        hangul_pronunciations = []
                        if "forms" in word:
                            forms: List[Dict] = word["forms"]
                            maybe_hanja_word: Optional[str] = None
                            for form in forms:
                                if 'hanja' in form['tags'] and 'form' in form:
                                    maybe_hanja_word = form['form']
                            # Handle the case where the noun has Hanja roots
                            if maybe_hanja_word is not None:
                                hangul_word = focus_word
                                english_meanings = english_meanings_from_word(word)
                                glosses = glosses_from_word(word)
                                if maybe_hanja_word not in hanja_characters and len(maybe_hanja_word) == 1:
                                    add_hanja_character(hanja_characters, maybe_hanja_word, hangul_word, glosses, [hangul_word])
                                    n_new_characters += 1
                                upsert_korean_word(sino_korean_nouns, maybe_hanja_word, hangul_word, english_meanings, glosses)
                                n_new_sino_korean_nouns += 1
    print(f"Acquired {n_new_sino_korean_nouns} new pure Sion-Korean nouns and {n_new_characters} new Hanja.")
    
    print(f"Parsing pure Korean nouns.")
    pure_korean_nouns: Dict[Optional[str], Dict[str, KoreanWord]] = {}
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-noun", "ko-proper noun", "ko-num"):
                    focus_word = word["word"]
                    if is_hangul(focus_word):
                        if "forms" in word:
                            forms: List[Dict] = word["forms"]
                            maybe_hanja_word: Optional[str] = None
                            for form in forms:
                                if 'hanja' in form['tags'] and 'form' in form:
                                    maybe_hanja_word = form['form']
                            # Handle the case where the noun has Hanja roots
                            if maybe_hanja_word is None:
                                # process a pure Korean noun
                                hangul_word = focus_word
                                glosses = [] 
                                english_meanings = english_meanings_from_word(word)
                                glosses = glosses_from_word(word)
                                upsert_korean_word(pure_korean_nouns, None, hangul_word, english_meanings, glosses)
    print(f"Acquired {len(pure_korean_nouns[None])} new pure Korean nouns.")
    
    print(f"Parsing Sino-Korean verbs, adjectives and parts of speech.")
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-verb", "ko-adv", "ko-determ", "ko-adj", "ko-adverb"):
                    focus_word = word["word"]
                    if "forms" in word:
                        forms: List[Dict] = word["forms"]
                        maybe_hanja_word: Optional[str] = None
                        for form in forms:
                            if 'hanja' in form['tags'] and 'form' in form:
                                maybe_hanja_word = form['form']
                        # Handle the case where the noun has Hanja roots
                        if maybe_hanja_word is not None:
                            stripped_hanja, maybe_hanja_word = strip_common_verb_suffixes(maybe_hanja_word)
                            stripped_hangul, maybe_hangul_word = strip_common_verb_suffixes(focus_word)
                            # ugly as hell, but this is an important word
                            if maybe_hangul_word == '원래':
                                for maybe_hanja_word in ["元來", "原來"]:
                                    english_meanings = english_meanings_from_word(word)
                                    glosses = glosses_from_word(word)
                                    upsert_korean_word(sino_korean_nouns, maybe_hanja_word, maybe_hangul_word, english_meanings, glosses)
                                continue
                            if len(maybe_hanja_word) != len(maybe_hangul_word):
                                print(stripped_hangul)
                                print('Warning: ignoring word "' + focus_word + '"')
                                print(json.dumps(word, ensure_ascii=False, indent=1))
                            else:
                                english_meanings = english_meanings_from_word(word)
                                glosses = glosses_from_word(word)
                                upsert_korean_word(sino_korean_nouns, maybe_hanja_word, maybe_hangul_word, english_meanings, glosses)
    print(f"Now at {len(sino_korean_nouns)} Sino-Korean nouns after parsing Sino-korean verbs.")
    
    print(f"Parsing pure Korean verbs, adjectives and parts of speech.")
    pure_korean_verbs: Dict[Optional[str], Dict[str, KoreanWord]] = {}
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-verb", "ko-adv", "ko-determ", "ko-adj", "ko-verb-set", "ko-adverb"):
                    focus_word = word["word"]
                    if "forms" in word:
                        forms: List[Dict] = word["forms"]
                        maybe_hanja_word: Optional[str] = None
                        for form in forms:
                            if 'hanja' in form['tags'] and 'form' in form:
                                maybe_hanja_word = form['form']
                        # Handle the case where the noun has Hanja roots
                        if maybe_hanja_word is None:
                            hangul_word = focus_word
                            english_meanings = english_meanings_from_word(word)
                            glosses = glosses_from_word(word)
                            upsert_korean_word(pure_korean_verbs, None, hangul_word, english_meanings, glosses)
    print(f"Acquired {len(pure_korean_verbs[None])} pure Korean verbs.")

    # Temporary: just for listing the most recent thing we're trying to parse.
    target_template = "ko-num"
    print(f"Parsing {target_template}.")
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in (target_template):
                    focus_word = word["word"]
                    #print(focus_word)
                    #print(json.dumps(word, ensure_ascii=False, indent=1))
                    #blah = input()
