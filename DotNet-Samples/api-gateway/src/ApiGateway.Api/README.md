## Run API Gateway and Product Service

```PlainText
API Gateway: http://localhost:5000
Product Service: http://localhost:5002

# Client will access product service via API Gateway, not directly
http://localhost:5000/api/products

```

#### Curl command

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImp0aSI6IjlhNjkyNmVkLTViZWYtNGQ5OC1iZDUxLWQ1YjBkODQzNmMyOSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJ0ZXN0dXNlciIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFkbWluIiwiZXhwIjoxNzY5NTY2Mjg3LCJpc3MiOiJBcGlHYXRld2F5IiwiYXVkIjoiQXBpR2F0ZXdheUNsaWVudHMifQ.DnC2vxkOtrjKc1buhDXNZYS_PisE3UB62NRsgRKQg3A" \
  http://localhost:5000/api/products

```
