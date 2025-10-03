# Use a specific slim Python version for reproducibility
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Create a non-root user for better security
RUN useradd --create-home appuser
USER appuser
WORKDIR /home/appuser/app

# Copy the requirements file first to leverage Docker's build cache
COPY --chown=appuser:appuser requirements.txt .

# Install dependencies for the user. The --user flag is important.
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy the rest of your application code
COPY --chown=appuser:appuser . .

# Add the user's local bin directory to the PATH.
# This is where pip --user installs executables like uvicorn.
ENV PATH="/home/appuser/.local/bin:$PATH"

# Command to run the application
CMD ["uvicorn", "Main:app", "--host", "0.0.0.0", "--port", "10000"]