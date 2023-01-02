# Bugs
* KVVFS is the provider for the production deployment, but for standards-compliant local storage implementations,
  we exceed the limit on size, and much of the seed database can't be loaded. This issue affects Safari on MacOS
  and iOS, and makes the app unusable on those platforms.
* OPFS cannot be used on Github since it doesn't send the headers '"Cross-Origin-Embedder-Policy" = "require-corp",
  "Cross-Origin-Opener-Policy" = "same-origin".


# Outstanding features
* Card review & scheduling.
* Importing Anki databases.
* A centralized landing page.
* Design improvements.
