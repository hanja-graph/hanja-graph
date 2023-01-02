I'm operating on a couple constrints:

* I have a day job, and therefore limited time.
* I don't want to pay for any cloud services for my spare time project.

I would therefore like to have as little "design" as possible. This application
is designed in a local-first (or rather mostly local-only) approach.

I picked the following technical components.

* ReactJS because I have some experience with it, and it's well-supported.
* Embedding SQLLite as a database.
* Persisting SQlLite through OPFS and/or LocalStorage.
* Giving the user the ability to export and import DB artifacts, all of which
  will tend to be quite small (<5 MB) for syncing and sharing between devices.

The final choice is the most dubious. I expect it will be a pain to upload and
download files every time somebody wants to back up their database. This decision
can be later revisited fairly easily by implementing some sort of API-driven upload
and download to a blob storage service. It would be very easy to deploy the 
application with a Google Cloud API key and use Google Cloud Storage for this
purpose.

Given these constraints, the application is designed to be used on your primary 
mobile device. From session to session your user information will persist, so 
there will not be need to frequently sync.
