#!/usr/bin/env python3
import ast
import re
# This script helped us migrate the old schema to the new one.

# pip
import regex

def is_hangul(value: str):
    if regex.search(r'\p{IsHangul}', value.replace(" ", "")):
        return True
    return False

if __name__ == "__main__":
    english_lines = []
    korean_lines = []
    for i, row in enumerate(open("src/assets/sources/bravender/hanja_definition.sql", "r")):
        if i > 0:
            english_definitions = []
            korean_definitions = []
            line = row.rstrip('\n')
            line = line.rstrip(',')
            line = line.rstrip(';')
            query_vals = ast.literal_eval(line)
            definitions = query_vals[1].split(',')
            english_definitions = []
            for definition in definitions:
                # Remove (some number)
                definition = re.sub(r"\((\d+)\)", ' ', definition)
                # Remove U+#### codes
                definition = re.sub(r" U\+[A-Z0-9]+", ' ', definition)
                definition = re.sub(r"U\+[A-Z0-9]+ ", ' ', definition)
                if is_hangul(definition):
                    korean_definitions.append(definition)
                else:
                    new_english_definitions = definition.split(';')
                    new_english_definitions = [elem.strip().strip('\n') for elem in new_english_definitions if len(elem.strip().strip('\n')) > 0]
                    english_definitions += new_english_definitions
            for definition in english_definitions:
                english_lines.append(f"('{query_vals[0]}', '{definition}')")
            for definition in korean_definitions:
                korean_lines.append(f"('{query_vals[0]}', '{definition}')")
    with open("src/assets/sources/bravender/english_hanja_definition.sql", "w") as f:
        f.write("INSERT INTO `english_hanja_definition` VALUES\n");
        f.write(',\n'.join(english_lines))
        f.write('\nON CONFLICT DO NOTHING;')
    with open("src/assets/sources/bravender/korean_hanja_definition.sql", "w") as f:
        f.write("INSERT INTO `korean_hanja_definition` VALUES\n");
        f.write(',\n'.join(korean_lines))
        f.write('\nON CONFLICT DO NOTHING;')
