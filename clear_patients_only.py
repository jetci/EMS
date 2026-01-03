from src.models.ems_models import db, Patient
from src.main import app

app.app_context().push()

# Count before
before = Patient.query.count()
print(f'Patients before: {before}')

# Delete all patients
Patient.query.delete()
db.session.commit()

# Count after
after = Patient.query.count()
print(f'Patients after: {after}')
print(f'✅ Deleted {before} patients')
