#!/usr/bin/env python3
import ast
# This script helped us migrate the old schema to the new one.

if __name__ == "__main__":
    lines = []
    for i, row in enumerate(open("src/assets/sources/bravender/korean_pronunciation.sql", "r")):
        if i > 0:
            line = row.rstrip('\n')
            line = line.rstrip(',')
            line = line.rstrip(';')
            query_vals = ast.literal_eval(line)
            hanjas = query_vals[0]
            hangul = query_vals[1]
            assert len(hangul) == 1
            for hanja in hanjas:
                if hanja != ' ':
                    lines.append(f"('{hanja}', '{hangul}')")
        with open("src/assets/sources/bravender/new_korean_pronunciation.sql", "w") as f:
            f.write("INSERT INTO word_list VALUES\n")
            f.write(',\n'.join(lines))
            f.write('\nON CONFLICT DO NOTHING;')
