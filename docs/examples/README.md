# 📚 Code Examples

This folder contains integration examples for common tasks in the EMS application.

## 📋 Available Examples

### 1. **LOADING_STATE_INTEGRATION_EXAMPLE.tsx**
How to properly implement loading states and skeleton screens in React components.

**Topics covered:**
- Using `LoadingSpinner` component
- Skeleton screens for better UX
- Loading + Error + Success states
- Combined error handling

**Use case:** When you need to show loading indicators while fetching data.

---

### 2. **PAGINATION_INTEGRATION_EXAMPLE.tsx**
How to implement pagination for list views and tables.

**Topics covered:**
- Managing pagination state (currentPage, itemsPerPage, totalPages)
- Updating API calls with pagination parameters
- Using the Pagination component
- Handling page changes
- Optional: Dynamic items per page selection

**Use case:** When you have large datasets that need to be split into pages.

---

### 3. **VALIDATION_INTEGRATION_EXAMPLE.tsx**
How to integrate input validation into form components.

**Topics covered:**
- Importing validation utilities
- Managing validation error state
- Validating data before submission
- Displaying validation errors
- Optional: Field-level validation
- Optional: Real-time validation feedback

**Use case:** When you need to ensure data quality before submission.

---

### 4. **VALIDATION_RIDE_REQUEST_EXAMPLE.tsx**
Specialized validation example for ride request forms.

**Topics covered:**
- Validating ride-specific data
- Real-time field validation
- Progressive validation on submit
- Disabling submit button until valid
- Error message display
- Integration with API calls

**Use case:** Specific to the CommunityRequestRidePage ride request workflow.

---

### 5. **RATE_LIMITING_INTEGRATION_EXAMPLE.ts**
How to add rate limiting to API routes.

**Topics covered:**
- Importing rate limiters
- Adding limiters to POST/PUT/DELETE routes
- Testing rate limiting behavior
- Handling 429 Too Many Requests responses
- Configuring rate limiter options

**Use case:** When you need to protect your API from abuse or excessive requests.

---

## 🚀 How to Use These Examples

1. **Copy-paste relevant code** from the example file into your component
2. **Adjust imports** to match your project structure
3. **Customize variable names** to match your component state
4. **Test thoroughly** before deploying

## 💡 Quick Tips

- Start with simple implementations, then add complexity as needed
- Always include error handling alongside data loading
- Test edge cases (empty data, errors, slow networks)
- Consider UX implications when choosing loading indicators
- Keep validation messages user-friendly (Thai language)

## 📚 Related Documentation

- **Validation**: Check `wecare-backend/src/utils/validation.ts`
- **API Client**: Check `src/services/apiClient.ts`
- **Components**: Check `src/components/ui/` for available UI components
- **Rate Limiting**: Check `wecare-backend/src/middleware/rateLimiter.ts`

---

**Last Updated:** 2026-02-05
