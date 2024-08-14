function isPalindrome(s: string): boolean {
  return s === s.split("").reverse().join("");
}
