# api/skill_data.py

ROLE_SKILL_MAP = {
    "Full Stack Developer": [
        "HTML", "CSS", "JavaScript", "React", "Redux", "Node.js", "Express", "MongoDB", "SQL",
        "Git", "Docker", "REST APIs", "Authentication", "Testing", "Webpack", "CI/CD", "AWS"
    ],

    "Frontend Developer": [
        "HTML", "CSS", "JavaScript", "React", "Redux", "TypeScript", "Webpack", "SASS",
        "Responsive Design", "Cross-browser Compatibility", "Testing", "Git"
    ],

    "Backend Developer": [
        "Node.js", "Express", "MongoDB", "SQL", "Docker", "Authentication", "REST APIs",
        "GraphQL", "Microservices", "Unit Testing", "Git", "Caching", "Message Queues"
    ],

    "Data Scientist": [
        "Python", "Pandas", "NumPy", "Scikit-learn", "SQL", "Matplotlib", "Seaborn",
        "Data Cleaning", "Feature Engineering", "Machine Learning", "Deep Learning",
        "Statistics", "TensorFlow", "Keras", "Natural Language Processing"
    ],

    "DevOps Engineer": [
        "Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Monitoring", "Git",
        "Networking", "Security Best Practices", "Scripting (Bash, Python)", "CloudFormation",
        "Load Balancers", "Scaling", "Logging"
    ]
}

# Optional: Roadmap for each skill, could be used later for recommendations
SKILL_ROADMAP = {
    "JavaScript": ["Learn JS basics", "Understand DOM manipulation", "ES6+ features", "Asynchronous JS"],
    "React": ["Components and Props", "State and Lifecycle", "Hooks", "React Router", "Redux"],
    "Docker": ["Containers basics", "Docker CLI", "Docker Compose", "Dockerfile", "Networking in Docker"],
    "AWS": ["AWS Basics", "EC2 & S3", "IAM & Security", "Lambda & Serverless", "CloudFormation"],
    # ... add more as needed
}
