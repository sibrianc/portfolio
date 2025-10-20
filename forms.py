# forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Email, Length

# Contact form for public users
class ContactForm(FlaskForm):
    # NOTE: Basic contact form for public users
    name = StringField("form_name", validators=[DataRequired(), Length(max=120)])
    email = StringField("form_email", validators=[DataRequired(), Email(), Length(max=240)])
    message = TextAreaField("form_message", validators=[DataRequired(), Length(max=2000)])
    submit = SubmitField("form_send")

# Admin login form
class AdminLoginForm(FlaskForm):
    # NOTE: Admin-only login form
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Log In")

# Admin project form for creating/editing projects
class ProjectForm(FlaskForm):
    # NOTE: Admin project CRUD form
    title = StringField("Title", validators=[DataRequired(), Length(max=120)])
    slug = StringField("Slug", validators=[DataRequired(), Length(max=140)])
    summary = StringField("Summary", validators=[Length(max=280)])
    description = TextAreaField("Description")
    tech_stack = StringField("Tech stack (CSV)", validators=[Length(max=240)])
    repo_url = StringField("Repo URL")
    live_url = StringField("Live URL")
    cover_image = StringField("Cover image URL", validators=[Length(max=240)])
    is_featured = BooleanField("Featured")
    submit = SubmitField("Save")
