// 탭 전환 함수
function openProblem(evt, problemName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(problemName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// 공통 기능: 구슬 렌더링
function renderMarbles(boxElement, count) {
    boxElement.innerHTML = '';
    for(let i=0; i<count; i++) {
        const dot = document.createElement('div');
        dot.className = 'marble-dot';
        boxElement.appendChild(dot);
    }
}

// 공통 기능: 구슬 이동 애니메이션
function animateMarblesTransfer(fromId, toId, amount, prefix, onComplete) {
    const fromBox = document.getElementById(`${prefix}-box-${fromId}`);
    const toBox = document.getElementById(`${prefix}-box-${toId}`);
    const fromPerson = document.getElementById(`${prefix}-person-${fromId}`);
    const toPerson = document.getElementById(`${prefix}-person-${toId}`);

    fromPerson.classList.add('highlight');
    toPerson.classList.add('highlight');

    const visualAmount = Math.min(amount, 30); 
    let completed = 0;

    for(let i=0; i<visualAmount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'moving-marble';
            
            // 문제별 특수 스타일 적용
            if (prefix === 'p5') particle.classList.add('moving-water');
            if (prefix === 'p6') particle.classList.add('moving-egg');

            const fromRect = fromBox.getBoundingClientRect();
            const toRect = toBox.getBoundingClientRect();

            const startX = fromRect.left + 10 + Math.random() * (fromRect.width - 20);
            const startY = fromRect.top + 10 + Math.random() * (fromRect.height - 20);
            const endX = toRect.left + 10 + Math.random() * (toRect.width - 20);
            const endY = toRect.top + 10 + Math.random() * (toRect.height - 20);
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            document.body.appendChild(particle);
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
        }, i * 30);
    }
}

// 문제 1 로직 클래스
class Problem1 {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                desc: "현재: 모두 48개씩 가짐",
                explanation: "💡 마지막 순간입니다. 거꾸로 되돌려 볼까요?",
                counts: { A: 48, B: 48, C: 48 },
                activeRow: "p1-row-step3",
                action: null
            },
            {
                desc: "③ 취소: C가 A에게 준 것을 돌려받음",
                explanation: "💡 C가 A에게 'A만큼' 주었으므로, A는 2배가 되어 48개가 된 것입니다.\n따라서 A의 원래 구슬은 24개이고, 24개를 C에게 돌려줍니다.",
                counts: { A: 24, B: 48, C: 72 },
                activeRow: "p1-row-step2",
                action: { from: 'A', to: 'C', amount: 24 }
            },
            {
                desc: "② 취소: B가 C에게 준 것을 돌려받음",
                explanation: "💡 B가 C에게 'C만큼' 주었으므로, C는 2배가 되어 72개가 된 것입니다.\n따라서 C의 원래 구슬은 36개이고, 36개를 B에게 돌려줍니다.",
                counts: { A: 24, B: 84, C: 36 },
                activeRow: "p1-row-step1",
                action: { from: 'C', to: 'B', amount: 36 }
            },
            {
                desc: "① 취소: A가 B에게 준 것을 돌려받음 (처음)",
                explanation: "💡 A가 B에게 'B만큼' 주었으므로, B는 2배가 되어 84개가 된 것입니다.\n따라서 B의 원래 구슬은 42개이고, 42개를 A에게 돌려줍니다.\n\n🎉 정답: B의 처음 구슬은 42개!",
                counts: { A: 66, B: 42, C: 36 },
                activeRow: "p1-row-initial",
                action: { from: 'B', to: 'A', amount: 42 }
            }
        ];
        this.init();
    }

    init() {
        document.getElementById('p1-prev-btn').onclick = () => this.nextStep();
        document.getElementById('p1-reset-btn').onclick = () => this.reset();
        this.updateUI();
    }

    updateUI() {
        const step = this.steps[this.currentStep];
        const ids = Object.keys(step.counts);
        ids.forEach(id => {
            const el = document.querySelector(`#p1-person-${id} .count`);
            if (el) el.innerText = step.counts[id];
            renderMarbles(document.getElementById(`p1-box-${id}`), step.counts[id]);
        });
        
        document.getElementById('p1-step-info').innerText = step.desc;
        document.getElementById('p1-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p1-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        ids.forEach((id, index) => {
            cells[index + 1].innerText = step.counts[id];
        });
        document.getElementById('p1-prev-btn').disabled = (this.currentStep === this.steps.length - 1);
    }

    nextStep() {
        if(this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            const action = this.steps[this.currentStep].action;
            if(action) {
                animateMarblesTransfer(action.from, action.to, action.amount, 'p1', () => this.updateUI());
            } else { this.updateUI(); }
        }
    }

    reset() {
        this.currentStep = 0;
        ['p1-row-initial', 'p1-row-step1', 'p1-row-step2'].forEach(id => {
            const cells = document.getElementById(id).querySelectorAll('td');
            for(let i=1; i<cells.length; i++) cells[i].innerText = '?';
        });
        this.updateUI();
    }
}

// 문제 2 로직 클래스
class Problem2 {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                desc: "현재: 모두 54개씩 가짐",
                explanation: "💡 모두 54개씩 있습니다. 마지막에 C가 이겨서 이렇게 된 거예요. 시간을 돌려볼까요?",
                counts: { A: 54, B: 54, C: 54 },
                activeRow: "p2-row-step3",
                action: null
            },
            {
                desc: "③ 취소: C가 이기기 전으로 (C 승리 취소)",
                explanation: "💡 C는 승리하여 A와 B로부터 각각 '자신의 구슬만큼' 받았습니다.\n즉, 원래 구슬의 3배가 되어 54개가 된 것입니다.\nC의 원래 구슬은 18개이고, A와 B에게 각각 18개씩 돌려줍니다.",
                counts: { A: 72, B: 72, C: 18 },
                activeRow: "p2-row-step2",
                action: { from: 'C', to: ['A', 'B'], amount: 18 }
            },
            {
                desc: "② 취소: B가 이기기 전으로 (B 승리 취소)",
                explanation: "💡 B는 승리하여 A와 C로부터 각각 '자신의 구슬만큼' 받아 72개가 되었습니다.\nB의 원래 구슬은 72 / 3 = 24개이고, A와 C에게 각각 24개씩 돌려줍니다.",
                counts: { A: 96, B: 24, C: 42 },
                activeRow: "p2-row-step1",
                action: { from: 'B', to: ['A', 'C'], amount: 24 }
            },
            {
                desc: "① 취소: A가 이기기 전으로 (처음 상태)",
                explanation: "💡 A는 승리하여 B와 C로부터 각각 '자신의 구슬만큼' 받아 96개가 되었습니다.\nA의 원래 구슬은 96 / 3 = 32개이고, B와 C에게 각각 32개씩 돌려줍니다.\n\n🎉 정답: A=32, B=56, C=74!",
                counts: { A: 32, B: 56, C: 74 },
                activeRow: "p2-row-initial",
                action: { from: 'A', to: ['B', 'C'], amount: 32 }
            }
        ];
        this.init();
    }

    init() {
        document.getElementById('p2-prev-btn').onclick = () => this.nextStep();
        document.getElementById('p2-reset-btn').onclick = () => this.reset();
        this.updateUI();
    }

    updateUI() {
        const step = this.steps[this.currentStep];
        const ids = Object.keys(step.counts);
        ids.forEach(id => {
            const el = document.querySelector(`#p2-person-${id} .count`);
            if (el) el.innerText = step.counts[id];
            renderMarbles(document.getElementById(`p2-box-${id}`), step.counts[id]);
        });
        
        document.getElementById('p2-step-info').innerText = step.desc;
        document.getElementById('p2-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p2-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        ids.forEach((id, index) => {
            cells[index + 1].innerText = step.counts[id];
        });
        document.getElementById('p2-prev-btn').disabled = (this.currentStep === this.steps.length - 1);
    }

    nextStep() {
        if(this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            const action = this.steps[this.currentStep].action;
            if(action) {
                let targets = Array.isArray(action.to) ? action.to : [action.to];
                let completedCount = 0;
                targets.forEach(target => {
                    animateMarblesTransfer(action.from, target, action.amount, 'p2', () => {
                        completedCount++;
                        if(completedCount === targets.length) this.updateUI();
                    });
                });
            } else { this.updateUI(); }
        }
    }

    reset() {
        this.currentStep = 0;
        ['p2-row-initial', 'p2-row-step1', 'p2-row-step2'].forEach(id => {
            const cells = document.getElementById(id).querySelectorAll('td');
            for(let i=1; i<cells.length; i++) cells[i].innerText = '?';
        });
        this.updateUI();
    }
}

// 문제 3 로직 (지원, 민주, 한결 - 장난감)
class Problem3 {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                desc: "현재: 모두 16개씩 가짐",
                explanation: "💡 마지막에 모두 똑같이 16개씩 가졌습니다. 거꾸로 되돌려 볼까요?",
                counts: { jiwon: 16, minju: 16, hangyeol: 16 },
                activeRow: "p3-row-step2",
                action: null
            },
            {
                desc: "② 취소: 민주가 한결이에게 준 6개를 돌려받음",
                explanation: "💡 민주가 한결이에게 6개를 주었으므로, 거꾸로 한결이가 민주에게 6개를 다시 줍니다.",
                counts: { jiwon: 16, minju: 22, hangyeol: 10 },
                activeRow: "p3-row-step1",
                action: { from: 'hangyeol', to: 'minju', amount: 6 }
            },
            {
                desc: "① 취소: 지원이가 민주에게 준 8개를 돌려받음 (처음)",
                explanation: "💡 지원이가 민주에게 8개를 주었으므로, 거꾸로 민주가 지원이에게 8개를 다시 줍니다.\n\n🎉 정답: 지원=24, 민주=14, 한결=10!",
                counts: { jiwon: 24, minju: 14, hangyeol: 10 },
                activeRow: "p3-row-initial",
                action: { from: 'minju', to: 'jiwon', amount: 8 }
            }
        ];
        this.init();
    }
    init() {
        document.getElementById('p3-prev-btn').onclick = () => this.nextStep();
        document.getElementById('p3-reset-btn').onclick = () => this.reset();
        this.updateUI();
    }
    updateUI() {
        const step = this.steps[this.currentStep];
        const ids = Object.keys(step.counts);
        ids.forEach(id => {
            document.querySelector(`#p3-person-${id} .count`).innerText = step.counts[id];
            renderMarbles(document.getElementById(`p3-box-${id}`), step.counts[id]);
        });
        document.getElementById('p3-step-info').innerText = step.desc;
        document.getElementById('p3-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p3-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        ids.forEach((id, idx) => cells[idx+1].innerText = step.counts[id]);
        document.getElementById('p3-prev-btn').disabled = (this.currentStep === this.steps.length - 1);
    }
    nextStep() {
        if(this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            const action = this.steps[this.currentStep].action;
            if(action) animateMarblesTransfer(action.from, action.to, action.amount, 'p3', () => this.updateUI());
            else this.updateUI();
        }
    }
    reset() {
        this.currentStep = 0;
        ['p3-row-initial', 'p3-row-step1'].forEach(id => {
            const cells = document.getElementById(id).querySelectorAll('td');
            for(let i=1; i<cells.length; i++) cells[i].innerText = '?';
        });
        this.updateUI();
    }
}

// 문제 4 로직 (주머니 A, B - 구슬)
class Problem4 {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                desc: "현재: A는 B의 4배 (A=108, B=27)",
                explanation: "💡 합계 135개이고 A가 B의 4배이므로, B는 135÷5=27개, A는 108개입니다.",
                counts: { A: 108, B: 27 },
                activeRow: "p4-row-step2",
                action: null
            },
            {
                desc: "② 취소: B가 A에게 준 45개를 돌려받음",
                explanation: "💡 B가 A에게 45개를 주었으므로, 거꾸로 A가 B에게 45개를 다시 줍니다.",
                counts: { A: 63, B: 72 },
                activeRow: "p4-row-step1",
                action: { from: 'A', to: 'B', amount: 45 }
            },
            {
                desc: "① 취소: A가 B에게 준 36개를 돌려받음 (처음)",
                explanation: "💡 A가 B에게 36개를 주었으므로, 거꾸로 B가 A에게 36개를 다시 줍니다.\n\n🎉 정답: A=99, B=36!",
                counts: { A: 99, B: 36 },
                activeRow: "p4-row-initial",
                action: { from: 'B', to: 'A', amount: 36 }
            }
        ];
        this.init();
    }
    init() {
        document.getElementById('p4-prev-btn').onclick = () => this.nextStep();
        document.getElementById('p4-reset-btn').onclick = () => this.reset();
        this.updateUI();
    }
    updateUI() {
        const step = this.steps[this.currentStep];
        const ids = Object.keys(step.counts);
        ids.forEach(id => {
            document.querySelector(`#p4-person-${id} .count`).innerText = step.counts[id];
            renderMarbles(document.getElementById(`p4-box-${id}`), step.counts[id]);
        });
        document.getElementById('p4-step-info').innerText = step.desc;
        document.getElementById('p4-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p4-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        ids.forEach((id, idx) => cells[idx+1].innerText = step.counts[id]);
        document.getElementById('p4-prev-btn').disabled = (this.currentStep === this.steps.length - 1);
    }
    nextStep() {
        if(this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            const action = this.steps[this.currentStep].action;
            if(action) animateMarblesTransfer(action.from, action.to, action.amount, 'p4', () => this.updateUI());
            else this.updateUI();
        }
    }
    reset() {
        this.currentStep = 0;
        ['p4-row-initial', 'p4-row-step1'].forEach(id => {
            const cells = document.getElementById(id).querySelectorAll('td');
            for(let i=1; i<cells.length; i++) cells[i].innerText = '?';
        });
        this.updateUI();
    }
}

// 문제 5 로직 (물통 A, B - 물)
class Problem5 {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                desc: "현재: 모두 120L씩 가짐",
                explanation: "💡 마지막에 똑같이 120L가 되었습니다. 거꾸로 되돌려 봅시다!",
                counts: { A: 120, B: 120 },
                activeRow: "p5-row-step3",
                action: null
            },
            {
                desc: "③ 취소: A가 B에게 준 것을 돌려받음",
                explanation: "💡 A가 B에게 'B만큼' 주어 B가 120L가 되었으므로, 원래 B는 60L였습니다.\nA가 B에게 60L를 돌려받습니다.",
                counts: { A: 180, B: 60 },
                activeRow: "p5-row-step2",
                action: { from: 'B', to: 'A', amount: 60 }
            },
            {
                desc: "② 취소: B가 A에게 준 것을 돌려받음",
                explanation: "💡 B가 A에게 'A만큼' 주어 A가 180L가 되었으므로, 원래 A는 90L였습니다.\nB가 A에게 90L를 돌려받습니다.",
                counts: { A: 90, B: 150 },
                activeRow: "p5-row-step1",
                action: { from: 'A', to: 'B', amount: 90 }
            },
            {
                desc: "① 취소: A가 B에게 준 것을 돌려받음 (처음)",
                explanation: "💡 A가 B에게 'B만큼' 주어 B가 150L가 되었으므로, 원래 B는 75L였습니다.\nA가 B에게 75L를 돌려받습니다.\n\n🎉 정답: 처음 A의 물은 165L!",
                counts: { A: 165, B: 75 },
                activeRow: "p5-row-initial",
                action: { from: 'B', to: 'A', amount: 75 }
            }
        ];
        this.init();
    }
    init() {
        document.getElementById('p5-prev-btn').onclick = () => this.nextStep();
        document.getElementById('p5-reset-btn').onclick = () => this.reset();
        this.updateUI();
    }
    updateUI() {
        const step = this.steps[this.currentStep];
        const ids = Object.keys(step.counts);
        ids.forEach(id => {
            document.querySelector(`#p5-person-${id} .count`).innerText = step.counts[id];
            renderMarbles(document.getElementById(`p5-box-${id}`), Math.floor(step.counts[id] / 2)); // 물은 개수가 많으니 절반만 렌더링
        });
        document.getElementById('p5-step-info').innerText = step.desc;
        document.getElementById('p5-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p5-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        ids.forEach((id, idx) => cells[idx+1].innerText = step.counts[id]);
        document.getElementById('p5-prev-btn').disabled = (this.currentStep === this.steps.length - 1);
    }
    nextStep() {
        if(this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            const action = this.steps[this.currentStep].action;
            if(action) animateMarblesTransfer(action.from, action.to, Math.floor(action.amount / 2), 'p5', () => this.updateUI());
            else this.updateUI();
        }
    }
    reset() {
        this.currentStep = 0;
        ['p5-row-initial', 'p5-row-step1', 'p5-row-step2'].forEach(id => {
            const cells = document.getElementById(id).querySelectorAll('td');
            for(let i=1; i<cells.length; i++) cells[i].innerText = '?';
        });
        this.updateUI();
    }
}

// 문제 6 로직 (달걀 바구니 1, 2, 3)
class Problem6 {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                desc: "현재: 모두 32개씩 가짐",
                explanation: "💡 마지막에 모두 32개씩 되었습니다. 거꾸로 가볼까요?",
                counts: { B1: 32, B2: 32, B3: 32 },
                activeRow: "p6-row-step3",
                action: null
            },
            {
                desc: "③ 취소: ③번이 ①번에게 준 것을 돌려받음",
                explanation: "💡 ③번이 ①번에게 '①번만큼' 주어 ①번이 32개가 되었으니, 원래 ①번은 16개였습니다.\n③번이 ①번에게 16개를 돌려받습니다.",
                counts: { B1: 16, B2: 32, B3: 48 },
                activeRow: "p6-row-step2",
                action: { from: 'B1', to: 'B3', amount: 16 }
            },
            {
                desc: "② 취소: ②번이 ③번에게 준 것을 돌려받음",
                explanation: "💡 ②번이 ③번에게 '③번만큼' 주어 ③번이 48개가 되었으니, 원래 ③번은 24개였습니다.\n②번이 ③번에게 24개를 돌려받습니다.",
                counts: { B1: 16, B2: 56, B3: 24 },
                activeRow: "p6-row-step1",
                action: { from: 'B3', to: 'B2', amount: 24 }
            },
            {
                desc: "① 취소: ①번이 ②번에게 준 것을 돌려받음 (처음)",
                explanation: "💡 ①번이 ②번에게 '②번만큼' 주어 ②번이 56개가 되었으니, 원래 ②번은 28개였습니다.\n①번이 ②번에게 28개를 돌려받습니다.\n\n🎉 정답: ①=44, ②=28, ③=24!",
                counts: { B1: 44, B2: 28, B3: 24 },
                activeRow: "p6-row-initial",
                action: { from: 'B2', to: 'B1', amount: 28 }
            }
        ];
        this.init();
    }
    init() {
        document.getElementById('p6-prev-btn').onclick = () => this.nextStep();
        document.getElementById('p6-reset-btn').onclick = () => this.reset();
        this.updateUI();
    }
    updateUI() {
        const step = this.steps[this.currentStep];
        const ids = Object.keys(step.counts);
        ids.forEach(id => {
            document.querySelector(`#p6-person-${id} .count`).innerText = step.counts[id];
            renderMarbles(document.getElementById(`p6-box-${id}`), step.counts[id]);
        });
        document.getElementById('p6-step-info').innerText = step.desc;
        document.getElementById('p6-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p6-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        ids.forEach((id, idx) => cells[idx+1].innerText = step.counts[id]);
        document.getElementById('p6-prev-btn').disabled = (this.currentStep === this.steps.length - 1);
    }
    nextStep() {
        if(this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            const action = this.steps[this.currentStep].action;
            if(action) animateMarblesTransfer(action.from, action.to, action.amount, 'p6', () => this.updateUI());
            else this.updateUI();
        }
    }
    reset() {
        this.currentStep = 0;
        ['p6-row-initial', 'p6-row-step1', 'p6-row-step2'].forEach(id => {
            const cells = document.getElementById(id).querySelectorAll('td');
            for(let i=1; i<cells.length; i++) cells[i].innerText = '?';
        });
        this.updateUI();
    }
}

// 앱 실행
window.onload = () => {
    new Problem1();
    new Problem2();
    new Problem3();
    new Problem4();
    new Problem5();
    new Problem6();
};
