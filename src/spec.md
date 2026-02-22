# Specification

## Summary
**Goal:** Add delete functionality to remove individual finance entries from the dashboard.

**Planned changes:**
- Add delete icon/button next to each finance entry (income, expenses, savings)
- Implement backend delete function with ownership validation
- Connect frontend delete buttons to backend using React Query mutation
- Update dashboard and comparison chart after deletion

**User-visible outcome:** Users can click a delete button next to any finance entry to remove it from their dashboard. The entry disappears immediately and charts update to reflect the change.
