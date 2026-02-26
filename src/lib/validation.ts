// Email validation with proper regex
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  
  return { valid: true }
}

// Password validation - minimum 8 characters, at least one letter and one number
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}

// Username validation - 3-20 characters, alphanumeric and underscores only
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' }
  }
  
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' }
  }
  
  if (username.length > 20) {
    return { valid: false, error: 'Username must be no more than 20 characters long' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  
  return { valid: true }
}

// Combined validation for signup
export function validateSignupForm(email: string, password: string, username: string): { valid: boolean; errors: { email?: string; password?: string; username?: string } } {
  const errors: { email?: string; password?: string; username?: string } = {}
  
  const emailCheck = validateEmail(email)
  if (!emailCheck.valid) errors.email = emailCheck.error
  
  const passwordCheck = validatePassword(password)
  if (!passwordCheck.valid) errors.password = passwordCheck.error
  
  const usernameCheck = validateUsername(username)
  if (!usernameCheck.valid) errors.username = usernameCheck.error
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// Combined validation for signin
export function validateSigninForm(email: string, password: string): { valid: boolean; errors: { email?: string; password?: string } } {
  const errors: { email?: string; password?: string } = {}
  
  const emailCheck = validateEmail(email)
  if (!emailCheck.valid) errors.email = emailCheck.error
  
  if (!password) {
    errors.password = 'Password is required'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
