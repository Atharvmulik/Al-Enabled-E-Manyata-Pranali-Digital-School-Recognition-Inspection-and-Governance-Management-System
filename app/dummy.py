import hashlib

password = "admin123"   # your admin password

hashed = hashlib.sha256(password.encode()).hexdigest()

print(hashed)