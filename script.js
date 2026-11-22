/* NetInfraPro - IT Infrastructure & Network Consulting
   Client-side scripts for canvas animation, typewriter, accordion, form redirect, and navigation */

document.addEventListener('DOMContentLoaded', () => {
    initTopologyCanvas();
    initTerminalTyping();
    initFaqAccordion();
    initWhatsAppConsultation();
    initNavbarInteractions();
});

/* Interactive network topology mesh background on hero canvas */
function initTopologyCanvas() {
    const canvas = document.getElementById('topology-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;

    let width = (canvas.width = hero.offsetWidth);
    let height = (canvas.height = hero.offsetHeight);

    const mouse = {
        x: null,
        y: null,
        radius: 140
    };

    hero.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    hero.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    hero.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
        }
    }, { passive: true });

    hero.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = hero.offsetWidth;
        height = canvas.height = hero.offsetHeight;
        createNodes();
    });

    class TopologyNode {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 0.75;
            this.vy = (Math.random() - 0.5) * 0.75;
            this.radius = Math.random() * 2 + 1.6;
            this.color = Math.random() > 0.22 ? '#00f3ff' : '#10b981';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= Math.cos(angle) * force * 1.6;
                    this.y -= Math.sin(angle) * force * 1.6;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    let nodes = [];
    const maxLinkDistance = 135;

    function createNodes() {
        nodes = [];
        const count = Math.min(Math.max(Math.floor((width * height) / 13500), 35), 85);
        for (let i = 0; i < count; i++) {
            nodes.push(new TopologyNode(Math.random() * width, Math.random() * height));
        }
    }

    function renderMesh() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update();
            nodes[i].draw();
        }

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < maxLinkDistance) {
                    const alpha = (1 - dist / maxLinkDistance) * 0.38;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
                    ctx.lineWidth = 0.85;
                    ctx.stroke();
                }
            }

            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - nodes[i].x;
                const dy = mouse.y - nodes[i].y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouse.radius) {
                    const alpha = (1 - dist / mouse.radius) * 0.55;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(renderMesh);
    }

    createNodes();
    renderMesh();
}

/* Terminal typing effect for hero title */
function initTerminalTyping() {
    const textTarget = document.getElementById('terminal-typing');
    if (!textTarget) return;

    const fullMessage = "> ping 192.168.1.1... Connection Established. Welcome to NetInfraPro Consulting.";
    let charIndex = 0;
    let isDeleting = false;

    function typeLoop() {
        if (!isDeleting) {
            textTarget.textContent = fullMessage.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === fullMessage.length) {
                setTimeout(() => {
                    isDeleting = true;
                    typeLoop();
                }, 5000);
                return;
            }
            setTimeout(typeLoop, 50);
        } else {
            textTarget.textContent = fullMessage.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                setTimeout(typeLoop, 800);
                return;
            }
            setTimeout(typeLoop, 25);
        }
    }

    typeLoop();
}

/* Accessible single-open FAQ accordion */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!questionBtn || !answer) return;

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach((otherItem) => {
                otherItem.classList.remove('active');
                const otherBtn = otherItem.querySelector('.faq-question');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                if (otherAnswer) otherAnswer.style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                questionBtn.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

/* Form validation and direct WhatsApp dispatch */
function initWhatsAppConsultation() {
    const form = document.getElementById('consultation-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('client-name');
        const companyInput = document.getElementById('client-company');
        const serviceSelect = document.getElementById('client-service');
        const messageTextarea = document.getElementById('client-message');
        const submitBtn = document.getElementById('btn-submit');

        const name = nameInput ? nameInput.value.trim() : '';
        const company = companyInput ? companyInput.value.trim() : '';
        const service = serviceSelect ? serviceSelect.value : '';
        const message = messageTextarea ? messageTextarea.value.trim() : '';

        if (!name || !service || !message) {
            alert('Silakan lengkapi nama, pilihan layanan, dan pesan sebelum mengirim formulir.');
            return;
        }

        const companyDisplay = company || '-';
        const waNumber = '6285180653460';
        const waText = `Halo NetInfraPro Consulting, saya ingin konsultasi IT:

*Nama:* ${name}
*Perusahaan / Instansi:* ${companyDisplay}
*Layanan:* ${service}
*Pesan:*
${message}

Mohon informasi jadwal dan ketersediaan tim konsultan. Terima kasih!`;

        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');

        if (submitBtn) {
            const originalHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-text">Membuka WhatsApp...</span> &rarr;';
            setTimeout(() => {
                submitBtn.innerHTML = originalHtml;
            }, 3000);
        }

        form.reset();
    });
}

/* Sticky header, hamburger navigation, and active link scroll spy */
function initNavbarInteractions() {
    const navbar = document.getElementById('navbar');
    const toggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            toggleBtn.setAttribute('aria-expanded', isOpen);
        });

        const allMenuLinks = navMenu.querySelectorAll('a');
        allMenuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                toggleBtn.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset + 130;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}
