from app.database import Base, engine
from app.models_db import User, Session


print("Creating AIEE database tables...")

Base.metadata.create_all(bind=engine)

print("AIEE database tables created successfully.")