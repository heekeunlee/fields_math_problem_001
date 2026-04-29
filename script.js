const steps = [
    {
        desc: "현재: 모든 과정을 마친 후 똑같이 48개씩 가짐",
        explanation: "💡 가장 마지막 순간입니다. 세 명 모두 구슬을 48개씩 가지고 있어요.\n누가 누구에게 주었는지 시간을 거꾸로 되돌려 봅시다!",
        a: 48, b: 48, c: 48,
        activeRow: "row-step3",
        action: null
    },
    {
        desc: "③ 취소: C가 A에게 주었던 구슬을 돌려받습니다.",
        explanation: "💡 C가 A에게 'A가 가진 것만큼' 주었기 때문에, 방금 전 A의 구슬은 2배가 되어 48개가 된 것입니다.\n따라서 A가 원래 가지고 있던 구슬은 48의 절반인 24개입니다.\nA는 절반(24개)을 C에게 돌려줍니다.",
        a: 24, b: 48, c: 72,
        activeRow: "row-step2",
        action: { from: 'A', to: 'C', amount: 24 }
    },
    {
        desc: "② 취소: B가 C에게 주었던 구슬을 돌려받습니다.",
        explanation: "💡 B가 C에게 'C가 가진 것만큼' 주었기 때문에, C의 구슬은 2배가 되어 72개가 된 것입니다.\n따라서 C가 원래 가지고 있던 구슬은 72의 절반인 36개입니다.\nC는 절반(36개)을 B에게 돌려줍니다.",
        a: 24, b: 84, c: 36,
        activeRow: "row-step1",
        action: { from: 'C', to: 'B', amount: 36 }
    },
    {
        desc: "① 취소: A가 B에게 주었던 구슬을 돌려받습니다.",
        explanation: "💡 A가 B에게 'B가 가진 것만큼' 주었기 때문에, B의 구슬은 2배가 되어 84개가 된 것입니다.\n따라서 B가 원래 가지고 있던 구슬은 84의 절반인 42개입니다.\nB는 절반(42개)을 A에게 돌려줍니다.\n\n🎉 정답: B가 처음 가지고 있던 구슬은 42개입니다!",
        a: 66, b: 42, c: 36,
        activeRow: "row-initial",
        action: { from: 'B', to: 'A', amount: 42 }
    }
];

let currentStep = 0;

const countA = document.querySelector('#person-A .count');
const countB = document.querySelector('#person-B .count');
const countC = document.querySelector('#person-C .count');
const boxA = document.getElementById('box-A');
const boxB = document.getElementById('box-B');
const boxC = document.getElementById('box-C');

const stepInfo = document.getElementById('step-info');
const explanationBox = document.getElementById('explanation-box');
const prevBtn = document.getElementById('prev-btn');
const resetBtn = document.getElementById('reset-btn');

function renderMarbles(boxElement, count) {
    boxElement.innerHTML = '';
    for(let i=0; i<count; i++) {
        const dot = document.createElement('div');
        dot.className = 'marble-dot';
        boxElement.appendChild(dot);
    }
}

function updateUI() {
    const step = steps[currentStep];
    
    // Set text numbers
    countA.innerHTML = step.a;
    countB.innerHTML = step.b;
    countC.innerHTML = step.c;

    // Render exact number of marbles in boxes
    renderMarbles(boxA, step.a);
    renderMarbles(boxB, step.b);
    renderMarbles(boxC, step.c);

    // Update texts
    stepInfo.innerText = step.desc;
    explanationBox.innerText = step.explanation;

    // Update Table
    document.querySelectorAll('tr').forEach(tr => tr.classList.remove('active-row'));
    document.getElementById(step.activeRow).classList.add('active-row');
    
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
        prevBtn.innerText = "시간 되돌리기 ⏳ (다음 단계)";
        prevBtn.disabled = false;
    }
}

function animateMarblesTransfer(fromId, toId, amount, onComplete) {
    const fromBox = document.getElementById(`box-${fromId}`);
    const toBox = document.getElementById(`box-${toId}`);
    
    const fromPerson = document.getElementById(`person-${fromId}`);
    const toPerson = document.getElementById(`person-${toId}`);

    fromPerson.classList.add('highlight');
    toPerson.classList.add('highlight');

    // Visual amount is capped so it doesn't lag, but shows a good stream of marbles
    const visualAmount = Math.min(amount, 30); 
    let completed = 0;

    for(let i=0; i<visualAmount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'moving-marble';
            
            const fromRect = fromBox.getBoundingClientRect();
            const toRect = toBox.getBoundingClientRect();

            // Random positions inside the boxes
            const startX = fromRect.left + 10 + Math.random() * (fromRect.width - 20);
            const startY = fromRect.top + 10 + Math.random() * (fromRect.height - 20);
            
            const endX = toRect.left + 10 + Math.random() * (toRect.width - 20);
            const endY = toRect.top + 10 + Math.random() * (toRect.height - 20);
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            document.body.appendChild(particle);
            
            // force reflow
            void particle.offsetWidth;
            
            particle.style.left = endX + 'px';
            particle.style.top = endY + 'px';

            setTimeout(() => {
                particle.remove();
                completed++;
                if(completed === visualAmount) {
                    fromPerson.classList.remove('highlight');
                    toPerson.classList.remove('highlight');
                    if(onComplete) onComplete();
                }
            }, 800);
        }, i * 30); // stagger the animation
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

prevBtn.addEventListener('click', () => {
    if(currentStep < steps.length - 1) {
        prevBtn.disabled = true; // Disable during animation
        currentStep++;
        const step = steps[currentStep];
        const action = step.action;
        
        if(action) {
            // Empty the transferred amount from source box immediately visually
            const fromBox = document.getElementById(`box-${action.from}`);
            const currentCount = fromBox.children.length;
            renderMarbles(fromBox, currentCount - action.amount);

            // Update texts immediately so user can read while animating
            stepInfo.innerText = step.desc;
            explanationBox.innerText = step.explanation;
            
            // Temporary animate counts backwards
            animateValue(countA, parseInt(countA.innerText), step.a, 1000);
            animateValue(countB, parseInt(countB.innerText), step.b, 1000);
            animateValue(countC, parseInt(countC.innerText), step.c, 1000);

            // Animate marbles flying, then fully update UI
            animateMarblesTransfer(action.from, action.to, action.amount, () => {
                updateUI();
            });

        } else {
            updateUI();
        }
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
    updateUI();
});

// Init
updateUI();
