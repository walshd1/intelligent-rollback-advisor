# Intelligent Rollback Advisor

Analyzes recent commits and deployment logs to suggest the most likely commit to rollback to in case of a failure.

## Free
```yaml
- uses: walshd1/intelligent-rollback-advisor@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## Paid (cost + 4.75%)
```yaml
- uses: walshd1/intelligent-rollback-advisor@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```
