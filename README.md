## Description

A book management application built with NestJS framework backend only.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Database Choice Decision
- For this demo, I used SQLite for simplicity, but in production, I’d use PostgreSQL because it offers better concurrency, indexing, and scalability.
- I could also use MongoDB. In this case I would have to store the authorId as an Object ID inside the MongoDB Atlass in the books table. But its better for unstructured data like for when I will add other features like ratings and genres in my book management system.
- SQLite is not suitable for production environments due to its single-process nature and lack of advanced features like replication and sharding.
-

## Class Diagram

Below is the class diagram for the core entities in the Book Management system.

```text
Author
- id: UUID (unique identifier)
- firstName: string (required)
- lastName: string (required)
- bio: string (optional)
- birthDate: Date (optional)
- createdAt: Date (auto-generated)
- updatedAt: Date (auto-generated)

Book
- id: UUID (unique identifier)
- title: string (required)
- isbn: string (unique, required) — e.g., "978-3-16-148410-0"
- publishedDate: Date (optional)
- genre: string (optional) — e.g., "Fantasy", "Science Fiction", "Thriller"
- author: Author (relation, required)
- createdAt: Date (auto-generated)
- updatedAt: Date (auto-generated)
```

## Testing
- For testing the Authors service spec test and the E2E tests run:

```
npm run test
```

## Future Implementations Plan:
- API Contract
- Postman collection and environment
- Husky for managing pre commit and running npm run build before commits so errors can be found more easily. This will make it so that deployments run smoothly
- Add env for local and production
- Running separate features concurrently in separate branches for multiple dev environment

## Live Site:
https://nestjs-book-man.onrender.com/

