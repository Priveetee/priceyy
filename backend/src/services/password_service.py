import re

class PasswordService:
    MIN_LENGTH = 12
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL = True
    
    @staticmethod
    def validate(password: str) -> tuple[bool, str]:
        if len(password) < PasswordService.MIN_LENGTH:
            return False, f"Password must be at least {PasswordService.MIN_LENGTH} characters"
        
        if PasswordService.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            return False, "Password must contain uppercase letter"
        
        if PasswordService.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            return False, "Password must contain lowercase letter"
        
        if PasswordService.REQUIRE_DIGIT and not re.search(r'\d', password):
            return False, "Password must contain digit"
        
        if PasswordService.REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "Password must contain special character"
        
        return True, "Valid"
