Quality Checks

Token expiration: simulate a token expiration — the app should catch a 401 response and redirect the user to login, not loop or crash.
Stale closure: When the dependency on useEffect/useCallback is missing, the event handler can "remember" the old state value — this classic React pitfall should be deliberately built into the test scenario.
During logout, all sensitive state (token, user data) must be completely cleared, otherwise it is possible to return to the protected page with the "back" button.