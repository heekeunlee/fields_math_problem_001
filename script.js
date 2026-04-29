const steps = [
    {
        desc: "현재: 모든 과정을 마친 후 똑같이 48개씩 가짐",
        a: 48, b: 48, c: 48,
        activeRow: "row-step3",
        action: null
    },
    {
        desc: "③ 취소: C가 A에게 주었던 구슬을 돌려받습니다. (A의 구슬이 절반이 됨)",
        a: 24, b: 48, c: 72,
        activeRow: "row-step2",
        action: { from: 'A', to: 'C', amount: 24 }
    },
    {
        desc: "② 취소: B가 C에게 주었던 구슬을 돌려받습니다. (C의 구슬이 절반이 됨)",
        a: 24, b: 84, c: 36,
        activeRow: "row-step1",
        action: { from: 'C', to: 'B', amount: 36 }
    },
    {
        desc: "① 취소: A가 B에게 주었던 구슬을 돌려받습니다. (B의 구슬이 절반이 됨) - 처음 상태!",
        a: 66, b: 42, c: 36,
        activeRow: "row-initial",
        action: { from: 'B', to: 'A', amount: 42 }
    }
];

let currentStep = 0;

const countA = document.querySelector('#person-A .count');
const countB = document.querySelector('#person-B .count');
const countC = document.querySelector('#person-C .count');
const stepInfo = document.getElementById('step-info');
const prevBtn = document.getElementById('prev-btn');
const resetBtn = document.getElementById('reset-btn');

function updateUI() {
    const step = steps[currentStep];
    
    // Animate numbers
    animateValue(countA, parseInt(countA.innerText) || step.a, step.a, 1000);
    animateValue(countB, parseInt(countB.innerText) || step.b, step.b, 1000);
    animateValue(countC, parseInt(countC.innerText) || step.c, step.c, 1000);

    stepInfo.innerText = step.desc;

    // Update Table
    document.querySelectorAll('tr').forEach(tr => tr.classList.remove('active-row'));
    document.getElementById(step.activeRow).classList.add('active-row');
    
    // Fill table
    const row = document.getElementById(step.activeRow);
    const cells = row.querySelectorAll('td');
    cells[1].innerText = step.a;
    cells[2].innerText = step.b;
    cells[3].innerText = step.c;

    // Button states
    if(currentStep === steps.length - 1) {
        prevBtn.innerText = "🎉 B의 처음 구슬은 42개! 🎉";
        prevBtn.disabled = true;
    } else {
        prevBtn.innerText = "시간 되돌리기 ⏳ (이전 단계로)";
        prevBtn.disabled = false;
    }
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}

function createParticles(fromId, toId, amount) {
    const fromEl = document.getElementById(`person-${fromId}`);
    const toEl = document.getElementById(`person-${toId}`);
    
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    fromEl.classList.add('highlight');
    toEl.classList.add('highlight');

    setTimeout(() => {
        fromEl.classList.remove('highlight');
        toEl.classList.remove('highlight');
    }, 1000);

    const numParticles = Math.min(amount, 15); // Max visual particles
    
    for(let i=0; i<numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // start pos
        const startX = fromRect.left + fromRect.width/2 - 10 + (Math.random()*40-20);
        const startY = fromRect.top + fromRect.height/2 - 10 + (Math.random()*40-20);
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        document.body.appendChild(particle);
        
        // force reflow
        void particle.offsetWidth;
        
        // end pos
        const endX = toRect.left + toRect.width/2 - 10 + (Math.random()*40-20);
        const endY = toRect.top + toRect.height/2 - 10 + (Math.random()*40-20);
        
        setTimeout(() => {
            particle.style.left = endX + 'px';
            particle.style.top = endY + 'px';
            particle.style.opacity = '0';
        }, 50);

        setTimeout(() => {
            particle.remove();
        }, 1050);
    }
}

prevBtn.addEventListener('click', () => {
    if(currentStep < steps.length - 1) {
        currentStep++;
        const action = steps[currentStep].action;
        if(action) {
            createParticles(action.from, action.to, action.amount);
        }
        setTimeout(updateUI, 100);
    }
});

resetBtn.addEventListener('click', () => {
    currentStep = 0;
    // Reset table cells
    const rows = ['row-initial', 'row-step1', 'row-step2'];
    rows.forEach(rowId => {
        const cells = document.getElementById(rowId).querySelectorAll('td');
        cells[1].innerText = '?';
        cells[2].innerText = '?';
        cells[3].innerText = '?';
    });
    // Set first numbers immediately to avoid animating from 0
    countA.innerHTML = steps[0].a;
    countB.innerHTML = steps[0].b;
    countC.innerHTML = steps[0].c;
    updateUI();
});

// Init
countA.innerHTML = steps[0].a;
countB.innerHTML = steps[0].b;
countC.innerHTML = steps[0].c;
updateUI();
