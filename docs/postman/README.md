# AgBrain Postman Collection

## Import and run

1. Start the local stack with `docker compose up --build`.
2. In Postman, import `AgBrain.postman_collection.json`.
3. Import `AgBrain.local.postman_environment.json`.
4. Select the **AgBrain Local** environment.
5. Open the collection and choose **Run collection** with the default request order.

The collection uses Postman's cookie jar for the HTTP-only `agbrain-session` cookie. It generates a unique valid CPF, creates a producer, farm, and harvest, validates the API and representative error branches, then deletes the created resources and logs out.

The local environment targets `http://localhost:3334`. To use another deployment, duplicate the environment and change only `baseUrl`, `adminEmail`, and `adminPassword`.

## Optional CLI run

```bash
npx --yes newman run postman/AgBrain.postman_collection.json \
  --environment postman/AgBrain.local.postman_environment.json
```
