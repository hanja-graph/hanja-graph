#!/usr/bin/env python3
import ast
# This script helped us migrate the old schema to the new one.

if __name__ == "__main__":
    lines = []
    for i, row in enumerate(open("src/assets/sources/bravender/radicals.sql", "r")):
        if i > 0:
            line = row.rstrip('\n')
            line = line.rstrip(' ')
            line = line.rstrip(',')
            line = line.rstrip(';')
            query_vals = ast.literal_eval(line)
            hanjas = query_vals[1]
            radical = query_vals[0]
            assert len(radical) == 1
            for hanja in hanjas:
                if hanja != ' ':
                    lines.append(f"('{radical}', '{hanja}')")
        with open("src/assets/sources/bravender/new_radicals.sql", "w") as f:
            f.write("INSERT INTO radicals VALUES\n")
            f.write(',\n'.join(lines))
            f.write('\nON CONFLICT DO NOTHING;')
