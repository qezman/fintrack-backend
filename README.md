# FinTrack Backend

Fastify + Prisma REST API for FinTrack. Containerised and deployed on AWS EKS with IRSA for keyless S3 access.

## Stack
Node.js · Fastify · Prisma · PostgreSQL · TypeScript · Docker · AWS S3

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/transactions` | Get all transactions |
| POST | `/transactions` | Create transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/transactions/summary` | Income/expense summary |
| POST | `/uploads/presign` | Generate S3 presigned URL |
| GET | `/health` | Kubernetes liveness/readiness probe |

## Environment Variables
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (from Sealed Secret in K8s) |
| `JWT_SECRET` | JWT signing key (from Sealed Secret in K8s) |
| `AWS_REGION` | AWS region - injected via IRSA |
| `AWS_S3_BUCKET_NAME` | S3 bucket for receipt uploads |

## Local Development
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Related Repositories
| Repo | Description |
|---|---|
| [fintrack-infrastructure](https://github.com/qezman/fintrack-infrastructure) | Terraform - full infrastructure and deployment guide |
| [fintrack-frontend](https://github.com/qezman/fintrack-frontend) | React + Vite frontend |
| [fintrack-gitops](https://github.com/qezman/fintrack-gitops) | Kubernetes manifests |