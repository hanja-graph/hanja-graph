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
#ko-adverb - more adverbs
#ko-det - more determiners, using
#ko-adjective - more adjectives, using
#ko-proverb - a few proverbs, not worth messing with
#ko-prop - a few words, not worth messing with
#ko-conj/adj - conjugated adjectives, omitting

# Standard library
from typing import Dict, List, Set, Optional
import argparse
import os
import json

from parsing_tools import HanjaCharacterEntry, KoreanWord, is_hangul, build_hanja_english_definition_file, build_hanja_korean_definition_file, build_korean_pronunciation_file, build_word_list, add_hanja_character, upsert_korean_word, strip_common_verb_suffixes, add_hanja_character, dict_contains_hangul_word

def word_reader(file_name: str):
    for row in open(file_name, "r"):
        blob = json.loads(row)
        yield blob

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
                        add_hanja_character(hanja_characters, hanja_word, hangul_pronunciations, glosses, korean_meanings, english_meanings)
    print(f"Acquired {len(hanja_characters)} unique hanja characters.")

    print(f"Parsing explicit Sino-Korean nouns.")
    sino_korean_nouns: Dict[Optional[str], Dict[str, KoreanWord]] = {}
    type_to_pos: Dict[str, str] = {
            "ko-hanja/old": "character", 
            "ko-hanja/new": "character",
            "ko-hanja": "character",
            "ko-noun": "noun",
            "ko-proper noun": "proper-noun", 
            "ko-num": "number",
            "ko-verb": "verb", 
            "ko-verb-set": "verb",
            "ko-adv": "adverb", 
            "ko-determ": "determiner", 
            "ko-adj": "adjective", 
            "ko-adverb": "ad erb", 
            "ko-det": "determiner", 
            "ko-adjective": "adjective"
            }

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
                                upsert_korean_word(sino_korean_nouns, hanja_word, hangul_pronunciations[0], english_meanings, glosses, type_to_pos[head_template_name])
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
                                    add_hanja_character(hanja_characters, maybe_hanja_word, hangul_word, glosses, [hangul_word], english_meanings)
                                    n_new_characters += 1
                                upsert_korean_word(sino_korean_nouns, maybe_hanja_word, hangul_word, english_meanings, glosses, type_to_pos[head_template_name])
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
                                upsert_korean_word(pure_korean_nouns, None, hangul_word, english_meanings, glosses, type_to_pos[head_template_name])
    print(f"Acquired {len(pure_korean_nouns[None])} new pure Korean nouns.")
    
    print(f"Parsing Sino-Korean verbs, adjectives and parts of speech.")
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-verb", "ko-adv", "ko-determ", "ko-adj", "ko-adverb", "ko-det", "ko-adjective"):
                    focus_word = word["word"]
                    if "forms" in word:
                        forms: List[Dict] = word["forms"]
                        maybe_hanja_word: Optional[str] = None
                        for form in forms:
                            if 'hanja' in form['tags'] and 'form' in form:
                                maybe_hanja_word = form['form']
                        # Handle the case where the noun has Hanja roots
                        if maybe_hanja_word is not None:
                            maybe_hanja_word = strip_common_verb_suffixes(maybe_hanja_word)
                            maybe_hangul_word = strip_common_verb_suffixes(focus_word)
                            # ugly as hell, but this is an important word
                            if maybe_hangul_word == '원래':
                                for maybe_hanja_word in ["元來", "原來"]:
                                    english_meanings = english_meanings_from_word(word)
                                    glosses = glosses_from_word(word)
                                    upsert_korean_word(sino_korean_nouns, maybe_hanja_word, maybe_hangul_word, english_meanings, glosses, type_to_pos[head_template_name])
                                continue
                            if len(maybe_hanja_word) != len(maybe_hangul_word):
                                print('Warning: ignoring word "' + focus_word + '"')
                                print(json.dumps(word, ensure_ascii=False, indent=1))
                            else:
                                english_meanings = english_meanings_from_word(word)
                                glosses = glosses_from_word(word)
                                upsert_korean_word(sino_korean_nouns, maybe_hanja_word, maybe_hangul_word, english_meanings, glosses, type_to_pos[head_template_name])
    print(f"Now at {len(sino_korean_nouns)} Sino-Korean nouns after parsing Sino-korean verbs.")
    
    print(f"Parsing pure Korean verbs, adjectives and parts of speech.")
    pure_korean_verbs: Dict[Optional[str], Dict[str, KoreanWord]] = {}
    for word in word_reader(in_filename):
        if "head_templates" in word:
            head_templates: List[Dict] = word["head_templates"]
            for head_template in head_templates:
                head_template_name = head_template["name"]
                if head_template_name in ("ko-verb", "ko-adv", "ko-determ", "ko-adj", "ko-verb-set", "ko-adverb", "ko-det", "ko-adjective"):
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
                            if dict_contains_hangul_word(sino_korean_nouns, hangul_word):
                                continue
                            english_meanings = english_meanings_from_word(word)
                            glosses = glosses_from_word(word)
                            upsert_korean_word(pure_korean_verbs, None, hangul_word, english_meanings, glosses, type_to_pos[head_template_name])
    print(f"Acquired {len(pure_korean_verbs[None])} pure Korean verbs.")

    hanja_english_definitions_path = os.path.join(out_directory, "english_hanja_definition.sql");
    print(f"Writing Hanja English definitions to {hanja_english_definitions_path}.")
    build_hanja_english_definition_file(hanja_english_definitions_path, hanja_characters)

    korean_pronunciation_path = os.path.join(out_directory, "korean_pronunciation.sql");
    print(f"Writing Hanja Korean pronuncations to {korean_pronunciation_path}.")
    build_korean_pronunciation_file(korean_pronunciation_path, hanja_characters)

    korean_english_definitions_path = os.path.join(out_directory, "korean_hanja_definition.sql");
    print(f"Writing Hanja Korean definitions to {korean_english_definitions_path}.")
    build_hanja_korean_definition_file(korean_english_definitions_path, hanja_characters)

    word_list_path = os.path.join(out_directory, "word_list.sql");
    build_word_list(word_list_path, [sino_korean_nouns, pure_korean_verbs, pure_korean_nouns])
    print(f"Writing word definitions to {word_list_path}.")