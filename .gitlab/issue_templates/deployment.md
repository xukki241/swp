## Deployment Request

### Environment

- [ ] Development
- [ ] Staging
- [ ] Production

### Type

- [ ] New Feature Deployment
- [ ] Bug Fix Deployment
- [ ] Hotfix
- [ ] Rollback
- [ ] Configuration Change

### Details

**Branch/Tag:**
**Merge Request:** #

**Description:**

<!-- Describe what is being deployed -->

### Pre-Deployment Checklist

- [ ] All tests passing in CI/CD pipeline
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables updated (if needed)
- [ ] Documentation updated
- [ ] Deployment plan reviewed

### Database Changes

- [ ] No database changes
- [ ] Migrations included (backward compatible)
- [ ] Data backups required

### Rollback Plan

<!-- Describe how to rollback if deployment fails -->

### Deployment Steps

1.
2.
3.

### Post-Deployment Verification

- [ ] Application accessible
- [ ] API endpoints responding
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] No errors in logs
- [ ] Critical features tested

### Stakeholders

- **Deployed by:** @username
- **Reviewed by:** @username
- **Tested by:** @username

### Additional Notes

<!-- Any additional information -->

/label ~deployment
