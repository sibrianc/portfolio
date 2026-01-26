/* ==========================================================================
   CIPITIO SYSTEM: GUARDIAN MODE & ERROR HANDLER (FINAL)
   ========================================================================== */

export class CipitioSystem {
    constructor() {
        this.cipitio = document.getElementById('cipitio-entity');
        this.rock = document.getElementById('cipitio-rock');
        this.panel = document.getElementById('contact-panel');
        // Buscamos el formulario dentro del panel
        this.form = this.panel ? this.panel.querySelector('form') : null;
        this.inputs = document.querySelectorAll('.cyber-input');
        
        // Elementos del Modal (Ventana de Alerta)
        this.modal = document.getElementById('cyber-modal');
        this.modalMsg = document.getElementById('modal-message');
        this.closeBtn = document.getElementById('close-modal');

        this.isActive = false; // "true" solo cuando está atacando
        this.currentSide = 'left'; 

        if (this.cipitio && this.panel && this.inputs.length > 0) {
            this.init();
        }
    }

    init() {
        // 1. POSICIONAMIENTO INICIAL (Vigilancia)
        this.positionRandomly();

        // 2. ESCUCHAR EL ENVÍO DEL FORMULARIO
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.validateAndAct(e));
        }
        
        // 3. LISTENERS DEL MODAL (Cerrar ventana)
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hideModal());
        }
        // Cerrar con click afuera o ESC
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.hideModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
        });
        
        // Easter egg: Si le das click al Cipitío, cambia de sitio
        this.cipitio.addEventListener('click', () => this.positionRandomly());
    }

    positionRandomly() {
        if (this.isActive) return; // No mover si está atacando
        
        this.currentSide = Math.random() > 0.5 ? 'left' : 'right';
        this.cipitio.style.transition = 'left 1s ease-in-out';
        
        if (this.currentSide === 'left') {
            this.cipitio.style.left = `${Math.random() * 25 + 5}%`;
        } else {
            this.cipitio.style.left = `${Math.random() * 25 + 65}%`;
        }
    }

    // --- CEREBRO DE VALIDACIÓN ---
    validateAndAct(e) {
        let errorFound = false;
        let errorMsg = "";
        let targetInput = null;

        // A. DETECCIÓN DE BOTS (Campo Trampa 'bot_catcher')
        const botField = document.querySelector('input[name="bot_catcher"]');
        if (botField && botField.value !== "") {
            e.preventDefault(); // Bloquear envío
            console.warn("🤖 Bot detectado y bloqueado.");
            return; 
        }

        // B. VALIDACIÓN DE CAMPOS REALES
        const nameInput = this.form.querySelector('input[name="name"]');
        const emailInput = this.form.querySelector('input[name="email"]');
        const msgInput = this.form.querySelector('textarea[name="message"]');

        // 1. Validar Nombre
        if (!nameInput.value.trim()) {
            errorFound = true;
            errorMsg = "¡ALTO AHÍ! No has puesto tu nombre.";
            targetInput = nameInput;
        } 
        // 2. Validar Email (Vacío)
        else if (!emailInput.value.trim()) {
            errorFound = true;
            errorMsg = "Necesito tu correo para poder responderte.";
            targetInput = emailInput;
        }
        // 3. Validar Formato Email
        else if (!this.isValidEmail(emailInput.value)) {
            errorFound = true;
            errorMsg = "Ese correo parece incorrecto. Revísalo.";
            targetInput = emailInput;
        }
        // 4. Validar Mensaje
        else if (!msgInput.value.trim()) {
            errorFound = true;
            errorMsg = "¿Me vas a enviar un mensaje vacío? Escribe algo.";
            targetInput = msgInput;
        }

        // SI HAY ERROR...
        if (errorFound) {
            e.preventDefault(); // ¡STOP! No recargar página
            
            // 1. Mostrar Ventana de Alerta
            this.showModal(errorMsg);

            // 2. Cipitío Ataca al campo culpable
            if (!this.isActive) {
                this.attack(targetInput);
            }
        }
        // Si no hay error, el formulario se envía normalmente.
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // --- MANEJO DEL MODAL ---
    showModal(msg) {
        if(this.modal && this.modalMsg) {
            this.modalMsg.textContent = msg;
            this.modal.classList.add('active');
        }
    }

    hideModal() {
        if(this.modal) {
            this.modal.classList.remove('active');
        }
    }

    // --- ATAQUE DEL CIPITÍO ---
    attack(targetInput) {
        this.isActive = true;

        // Cálculos de Trayectoria
        const panelRect = this.panel.getBoundingClientRect();
        const cipitioRect = this.cipitio.getBoundingClientRect();
        const inputRect = targetInput.getBoundingClientRect();

        const startX = cipitioRect.left - panelRect.left + (cipitioRect.width / 2);
        const startY = cipitioRect.top - panelRect.top + (cipitioRect.height / 2);
        const endX = inputRect.left - panelRect.left + (inputRect.width / 2);
        const endY = inputRect.top - panelRect.top + (inputRect.height / 2);

        // Preparar Roca
        this.rock.style.transition = 'none'; 
        this.rock.style.transform = `translate(${startX}px, ${startY}px)`;
        this.rock.style.opacity = '0';

        // CAMBIAR A MODO ATAQUE
        // Esto sobreescribe la imagen idle por la de lanzar
        if (this.currentSide === 'left') {
            this.cipitio.classList.add('is-throwing-right');
        } else {
            this.cipitio.classList.add('is-throwing-left');
        }

        // LANZAR (Sincronizado con animación CSS ~220ms)
        setTimeout(() => {
            this.rock.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.6, 0.3, 1), opacity 0.1s';
            this.rock.style.opacity = '1';
            this.rock.style.transform = `translate(${endX}px, ${endY}px) rotate(720deg)`;
        }, 220);

        // IMPACTO Y REGRESO
        setTimeout(() => {
            this.rock.style.opacity = '0';
            this.triggerGlitch(targetInput);
            this.returnToWatch();
        }, 650); 
    }

    triggerGlitch(input) {
        input.classList.add('input-glitch');
        // NOTA: No hacemos input.focus() aquí para que el usuario
        // preste atención primero al mensaje del Modal.
        setTimeout(() => input.classList.remove('input-glitch'), 500);
    }

    returnToWatch() {
        // Quitar clases de ataque -> Vuelve automáticamente a la animación IDLE del CSS
        this.cipitio.classList.remove('is-throwing-right');
        this.cipitio.classList.remove('is-throwing-left');
        
        // Pequeño hack para reiniciar animaciones CSS si fuera necesario
        void this.cipitio.offsetWidth; 
        
        this.isActive = false;
        // El Cipitío se queda ahí, vigilando...
    }
}