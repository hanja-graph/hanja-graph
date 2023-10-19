export default function About() {
  return (
    <div>
      <h2>About Hanja Graph</h2>
      <p>
        Hanja graph is a Korean flash card program and dictionary. You can use
        it to look up words, and to save and review flash cards using spaced
        repetition.
      </p>
      <p>
        It's designed to help you remember Korean vocabulary by leveraging Hanja
        as a mnemonic.
      </p>
      <p>
        See <a href="https://github.com/hanja-graph/hanja-graph">Github</a> for
        more information. This program is and always will be free.
      </p>
      <h3>Using offline</h3>
      <p>
        On iOS, if you add Hanja graph to your reading list, it will work
        offline. The site is designed in an offline-first manner, and does not
        connect to any backend services.
      </p>
      <h3>Saving data</h3>
      <p>
        After you review some cards, you will want to ensure that you don't lose
        these reviews.
      </p>
      <p>
        Your data is saved and persisted to your device. It will be retained as
        long as you don't clear your browsing data. You can export your data to
        a file using the "Sync" menu. This will give you the option of exporting
        the dump to your device or a cloud service such as Google Drive or
        iCloud. You should probably do this once every couple days.
      </p>
      <h3>Reporting errors</h3>
      <p>
        Data from Hanja Graph is taken from several online sources. These
        sources are available{" "}
        <a href="https://github.com/hanja-graph/hanja-graph/tree/master/src/assets/sources">
          here.
        </a>
      </p>
      <p>
        If you feel something needs to be added or corrected, open a pull
        request against one of these files.
      </p>
      <h3>Thanks</h3>
      <p>Thanks to the compilers of the following data sources.</p>
      <ul>
        <li>
          <a href="https://github.com/dbravender/hanja-dictionary">
            Bravender Hanja Dictionary
          </a>
          (retrieved Jan 2, 2023)
        </li>
        <li>
          <a href="https://kaikki.org/dictionary/Korean/index.html">
            Korean machine-readable dictionary
          </a>
          (retrieved October 17, 2023), based on Wiktionary data.
        </li>
        <li>
          <a href="https://github.com/tatuylonen/wiktextract">Wiktextract</a>,
          used to produce the above dump.
        </li>
        <li>
          <a href="https://github.com/garfieldnate/kengdic">Kengdic</a>
          (retrieved October 17), a large crowdsourced Korean dictionary
          project. 2023.
        </li>
        <li>
          <a href="https://react.dev/">ReactJS</a>, the ubiquitious front-end
          framework.
        </li>
        <li>
          <a href="https://www.sqlite.org/index.html">SQLite</a>, the blazing
          fast local database service that works in WASM.{" "}
        </li>
        <li>
          <a href="https://en.wikipedia.org/wiki/SuperMemo">SM-2</a>, the second
          version of the SuperMemo algorithm.{" "}
        </li>
      </ul>
    </div>
  );
}
