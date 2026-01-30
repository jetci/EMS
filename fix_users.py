from src.models.ems_models import db, User
from src.main import app
from werkzeug.security import generate_password_hash

app.app_context().push()

# Update all users to Active status
users = User.query.all()
for user in users:
    user.status = 'Active'
    
db.session.commit()
print(f'✅ Updated {len(users)} users to Active status')

# List all users
print('\nUsers in database:')
for user in User.query.all():
    print(f'  {user.email} - {user.role} - {user.status}')
