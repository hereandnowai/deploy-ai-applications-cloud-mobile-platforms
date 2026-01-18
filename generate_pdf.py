import json
import urllib.request
import io
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

def create_pdf(filename, branding_path):
    # Load branding data
    with open(branding_path, 'r') as f:
        branding = json.load(f)['brand']

    doc = SimpleDocTemplate(filename, pagesize=letter,
                          rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=72)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor(branding['colors']['secondary']),
        alignment=1,
        spaceAfter=15
    )
    
    sub_title_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor("#333333"),
        alignment=1,
        spaceAfter=8
    )

    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor(branding['colors']['secondary']),
        spaceBefore=12,
        spaceAfter=8,
        fontName='Helvetica-Bold'
    )

    body_style = styles['BodyText']
    body_style.fontSize = 10
    body_style.leading = 12

    elements = []

    # 1. Logo at the top center
    try:
        logo_url = branding['logo']['title']
        with urllib.request.urlopen(logo_url) as response:
            logo_data = response.read()
            logo_img = Image(io.BytesIO(logo_data))
            # Scale logo
            aspect = logo_img.imageHeight / logo_img.imageWidth
            logo_img.drawWidth = 2.5 * inch
            logo_img.drawHeight = (2.5 * inch) * aspect
            logo_img.hAlign = 'CENTER'
            elements.append(logo_img)
            elements.append(Spacer(1, 15))
    except Exception as e:
        print(f"Error loading logo: {e}")

    # 2. Main Title & Subtitles
    elements.append(Paragraph("Deployment of AI Applications for Cloud and Mobile Platforms", title_style))
    elements.append(Paragraph(f"Presented by: {branding['organizationName']}", sub_title_style))
    elements.append(Paragraph("For: Vels Institute of Science, Technology & Advanced Studies (VISTAS)", sub_title_style))
    elements.append(Spacer(1, 15))

    # 3. Content Sections
    sections = [
        ("1. About " + branding['organizationName'], 
         "HERE AND NOW AI is a leading technology organization dedicated to making Artificial Intelligence accessible, ethical, and practical. We specialize in educating the next generation of engineers and developers on how to leverage AI to solve real-world problems. Our mission is to bridge the gap between complex AI research and scalable, production-ready applications."),
        ("2. About This Program", 
         "This 10-day intensive training program is designed to equip students with the skills required to take AI models from a local development environment to a global scale. We focus on the entire lifecycle—from containerization and cloud orchestration to mobile integration and performance optimization.")
    ]

    for title, text in sections:
        elements.append(Paragraph(title, heading_style))
        elements.append(Paragraph(text, body_style))

    # 4. Syllabus Table
    elements.append(Paragraph("3. 10-Day Training Schedule", heading_style))
    data = [
        ['Day', 'Topic', 'Description'],
        ['Day 1', 'Cloud Fundamentals', 'Introduction to Cloud Platforms and AI infrastructure.'],
        ['Day 2', 'Containerization', 'Mastering Docker for AI model packaging.'],
        ['Day 3', 'API Orchestration', 'Building robust REST and gRPC gateways.'],
        ['Day 4', 'Cloud Deployment', 'Scaling models using Kubernetes and Serverless.'],
        ['Day 5', 'DevOps for AI', 'Implementing CI/CD pipelines for AI.'],
        ['Day 6', 'Mobile AI Architecture', 'Designing AI integrations for iOS and Android.'],
        ['Day 7', 'Data Management', 'Cloud-native databases and vector stores.'],
        ['Day 8', 'Performance & Cost', 'Monitoring and cloud cost optimization.'],
        ['Day 9', 'Security & Ethics', 'Securing AI endpoints and ethical data practices.'],
        ['Day 10', 'Capstone Project', 'Final presentation of a deployed application.'],
    ]

    t = Table(data, colWidths=[0.6*inch, 1.4*inch, 4.0*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(branding['colors']['secondary'])),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f9f9f9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 15))

    # 5. Learning Outcomes
    elements.append(Paragraph("4. Learning Outcomes", heading_style))
    outcomes = [
        "• Deploy machine learning models securely on cloud platforms.",
        "• Write production-grade containers for AI workloads.",
        "• Design and implement API-driven mobile AI architectures.",
        "• Optimize AI applications for both cost and performance.",
        "• Deliver a full-stack Capstone Project demonstrating cloud-to-mobile AI integration."
    ]
    for outcome in outcomes:
        elements.append(Paragraph(outcome, body_style))

    # 6. Professional Footer
    elements.append(Spacer(1, 40))
    footer_text = (
        f"<b>{branding['organizationName']}</b><br/>"
        f"Mobile: {branding['mobile']} | Email: {branding['email']}<br/>"
        f"Website: {branding['website']}"
    )
    footer_style = ParagraphStyle('FooterStyle', parent=body_style, alignment=1, fontSize=9)
    elements.append(Paragraph(footer_text, footer_style))

    doc.build(elements)

if __name__ == "__main__":
    create_pdf("assets/pdfs/program-syllabus-vistas.pdf", "branding.json")
