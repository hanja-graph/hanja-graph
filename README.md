# Hanja Graph
A flash card program for Korean vocabulary that utilizes the Hanja word roots
to help you form associations between related words.

For more information on the intent and design of this project, please see the
[design](design/README.md) section.

# A production version of the app is deployed here:
* [DB browser](https://hanja-graph.github.io/hanja-graph/index.html?app=repl) - to debug the development database.
* [Card browser](https://hanja-graph.github.io/hanja-graph/index.html?app=card&card_id=1).
* [Insert](https://hanja-graph.github.io/hanja-graph/index.html?app=insert) - Insert a card.

## Instructions
### Developing
First, install [node.js](https://nodejs.org/en/download/). Then,
```bash
# Once
npm install
# Whenever you want to develop
npm run dev
```
### Apps
#### Database browser
Development versions:
(Available while `npm run dev` is active).
* [DB browser](https://localhost:3000/index.html?app=repl) - to debug the development database.
* [Card browser](https://localhost:3000/index.html?app=card&card_id=4).
* [Insert](https://localhost:3000/index.html?app=insert) - Insert a card.

Production versions:
(available after running `npm run build && ./test-server.py` - will predict what is available after deployment).
* [DB browser](https://localhost:3001/index.html?app=repl) - to debug the development database.
* [Card browser](https://localhost:3001/index.html?app=card&card_id=4).
* [Insert](https://localhost:3001/index.html?app=insert) - Insert a card.

# References
The Hanja dictionary seed comes from [here](https://github.com/dbravender/hanja-dictionary).
