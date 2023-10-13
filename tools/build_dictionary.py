#!/usr/bin/env python3

# Standard library
from typing import Dict, List, Set
import argparse
import os
import json

# pip
import regex

class HanjaWord:
    def __init__(self):
        self.english_meanings = set()
        self.korean_meanings = set()
    english_meanings: Set[str]
    korean_meanings: Set[str]

def word_reader(file_name: str):
    for row in open(file_name, "r"):
        blob = json.loads(row)
        yield blob

def is_hangul(value):
    if regex.search(r'\p{IsHangul}', value):
        return True
    return False

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
                        print(word)
    
    # By showing the head templates, we can determine that words with the following
    # head templates represent Hanja:
    # ko-hanja/new
    # ko-hanja
    # ko-hanja/old
    all_words: Dict[str, Dict[str, HanjaWord]] = {}
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
                    head_template_args: Dict = head_template["args"]
                    for sense in senses:
                        # Links appear to be loosely schematized like this:
                        # [['Hanja', 'hanja#English'], ['견', '견#Korean'], ['dog', 'dog']]
                        if "args" not in head_template:
                            continue
                        head_template_args = head_template["args"]
                        hangul_pronunciations = []
                        english_meanings = []
                        if "links" in sense:
                            links: List[List[str]] = []
                            links += sense["links"]
                            english_meanings += [link[0] for link in links if link[0].replace(" ", "").isalpha() and link[1].replace(" ","").isalpha()]
                        korean_meanings = [head_template_args[key] for key in head_template_args if len(head_template_args[key]) > 0]
                        hangul_pronunciations += [meaning for meaning in korean_meanings if len(meaning) == 1]

                        if "glosses" in sense:
                            glosses = sense["glosses"]
                            english_meanings += glosses
                        
                        if len(english_meanings) == 0:
                            continue
                        if len(hangul_pronunciations) == 0:
                            continue
                        if len(korean_meanings) == 0:
                            continue
                        if hanja_word not in all_words:
                            all_words[hanja_word] = {}
                        for hangul_pronunciation in set(hangul_pronunciations):
                            if hangul_pronunciation not in all_words[hanja_word]:
                                all_words[hanja_word][hangul_pronunciation] = HanjaWord()

                            for english_meaning in english_meanings:
                                all_words[hanja_word][hangul_pronunciation].english_meanings.add(english_meaning)
                            for korean_meaning in korean_meanings:
                                all_words[hanja_word][hangul_pronunciation].korean_meanings.add(korean_meaning)
    print(f"Acquired {len(all_words)} unique hanja words.")
