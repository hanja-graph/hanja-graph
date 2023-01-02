# Bugs
* Since nested workers can't be created in Safari browsers as of this writing, the OPFS implementation provided
  by the sqlite project doesn't work. It appears a change for this behavior is close to dropping, see
  [this bug](https://bugs.webkit.org/show_bug.cgi?id=25212).
* KVVFS is the provider for the production deployment, but for standards-compliant local storage implementations,
  we exceed the limit on size, and much of the seed database can't be loaded. This issue affects Safari on MacOS
  and iOS, and makes the app unusable on those platforms (since OPFS doesn't work on these platforms).
* OPFS cannot be used on Github since it doesn't send the headers '"Cross-Origin-Embedder-Policy" = "require-corp",
  "Cross-Origin-Opener-Policy" = "same-origin".


# Outstanding features
* Card review & scheduling.
* Importing Anki databases.
* A centralized landing page.
* Design improvements.
