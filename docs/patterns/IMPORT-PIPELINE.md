# Optional Import-Heavy Application Scaffold

Use this staged pipeline when imports are a major app feature:

`parse → validate/reconcile → preview policies and counts → recovery snapshot → explicit apply → result summary → rollback`

Parsing and preview must not mutate live state. Separate blocking validation errors from
warnings; warnings may be acknowledged only when application policy explicitly permits
it. Show each collection's `replace`, `merge`, `preserve-local-fields`, or
`reject-on-conflict` policy before confirmation. Apply atomically where the storage layer
supports it and retain the snapshot until the result is accepted.
