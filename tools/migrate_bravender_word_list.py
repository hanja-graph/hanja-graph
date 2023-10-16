#!/usr/bin/env python3
import ast
# This script helped us migrate the old schema to the new one.

if __name__ == "__main__":
    lines = []
    for i, row in enumerate(open("src/assets/sources/bravender/hanjas.sql", "r")):
        if i > 0:
            line = row.rstrip('\n')
            line = line.rstrip(',')
            line = line.rstrip(';')
            query_vals = ast.literal_eval(line)
            english_defs = query_vals[2]
            english_defs_list = english_defs.split(',')
            english_defs_list = [x.strip() for x in english_defs_list]
            for english_def in english_defs_list:
                lines.append(f"('{query_vals[0]}', '{query_vals[1]}', '{english_def}')")
        with open("src/assets/sources/bravender/word_list.sql", "w") as f:
            f.write("INSERT INTO word_list VALUES\n")
            f.write(',\n'.join(lines))
            f.write('\nON CONFLICT DO NOTHING;')
