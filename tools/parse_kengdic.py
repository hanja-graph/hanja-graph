#!/usr/bin/env python3


# Standard library
from typing import Dict, Optional
import argparse
import os

from parsing_tools import HanjaCharacterEntry, KoreanWord, upsert_korean_word, add_hanja_character, build_hanja_english_definition_file, build_hanja_korean_definition_file, build_korean_pronunciation_file, build_word_list


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
                    description='Builds SQL files from Kengdic data dumps.')
    parser.add_argument('in_filename', help="A file containing a Kengdic data dump, for example downloaded from https://github.com/garfieldnate/kengdic/")
    parser.add_argument('out_directory', help="A directory (to be created if it does not exist) to which to write the SQL files that hanja-graph can use.")
    args = parser.parse_args()

    in_filename: str = args.in_filename
    out_directory: str = args.out_directory

    print(f"Reading from {in_filename}, writing to {out_directory}")
    os.makedirs(out_directory, exist_ok=True)
    i = 0
    with_hanja = 0
    hanja_defs = 0
    without_hanja = 0
    hanja_characters: Dict[str, Dict[str, HanjaCharacterEntry]] = {}
    words: Dict[Optional[str], Dict[str, KoreanWord]] = {}
    for line in (open(in_filename, "r")):
        # Skip headers
        i += 1
        if i == 1:
            continue
        fields = line.split('\t')
        korean = fields[1]
        hanja = fields[2]
        english = fields[3]
        if len(korean) == 0:
            continue
        if len(english) == 0:
            continue
        if "'" in korean:
            korean = korean.replace("'", "")
        if len(hanja) > 0:
            split = hanja.split(',')
            if len(split) > 1:
                for elem in split:
                    if len(elem) != len(korean):
                        print(f"Warning: skipped word h={hanja},k={korean},e={english}")
                        upsert_korean_word(words, elem, korean, [english], [], 'unspecified')
                        if len(hanja) == 1:
                            hanja_defs += 1
                            add_hanja_character(hanja_characters, hanja, [korean], [], [], [english])
            elif len(hanja) != len(korean):
                print(f"Warning: skipping h={hanja},k={korean},e={english}")
            else:
                upsert_korean_word(words, hanja, korean, [english], [], 'unspecified')
            with_hanja += 1
            if len(hanja) == 1:
                hanja_defs += 1
                add_hanja_character(hanja_characters, hanja, [korean], [], [], [english])
        else:
            upsert_korean_word(words, None, korean, [english], [], 'unspecified')
            without_hanja += 1
    print(f"Read {with_hanja} words with hanja, {without_hanja} words without, {hanja_defs} new Hanja definitions.")
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
    build_word_list(word_list_path, [words])
    print(f"Writing word definitions to {word_list_path}.")

