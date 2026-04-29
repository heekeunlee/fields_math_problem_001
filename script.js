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
                a: 48, b: 48, c: 48,
                activeRow: "p1-row-step3",
                action: null
            },
            {
                desc: "③ 취소: C가 A에게 준 것을 돌려받음",
                explanation: "💡 C가 A에게 'A만큼' 주었으므로, A는 2배가 되어 48개가 된 것입니다.\n따라서 A의 원래 구슬은 24개이고, 24개를 C에게 돌려줍니다.",
                a: 24, b: 48, c: 72,
                activeRow: "p1-row-step2",
                action: { from: 'A', to: 'C', amount: 24 }
            },
            {
                desc: "② 취소: B가 C에게 준 것을 돌려받음",
                explanation: "💡 B가 C에게 'C만큼' 주었으므로, C는 2배가 되어 72개가 된 것입니다.\n따라서 C의 원래 구슬은 36개이고, 36개를 B에게 돌려줍니다.",
                a: 24, b: 84, c: 36,
                activeRow: "p1-row-step1",
                action: { from: 'C', to: 'B', amount: 36 }
            },
            {
                desc: "① 취소: A가 B에게 준 것을 돌려받음 (처음)",
                explanation: "💡 A가 B에게 'B만큼' 주었으므로, B는 2배가 되어 84개가 된 것입니다.\n따라서 B의 원래 구슬은 42개이고, 42개를 A에게 돌려줍니다.\n\n🎉 정답: B의 처음 구슬은 42개!",
                a: 66, b: 42, c: 36,
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
        document.querySelector('#p1-person-A .count').innerText = step.a;
        document.querySelector('#p1-person-B .count').innerText = step.b;
        document.querySelector('#p1-person-C .count').innerText = step.c;
        renderMarbles(document.getElementById('p1-box-A'), step.a);
        renderMarbles(document.getElementById('p1-box-B'), step.b);
        renderMarbles(document.getElementById('p1-box-C'), step.c);
        document.getElementById('p1-step-info').innerText = step.desc;
        document.getElementById('p1-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p1-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        cells[1].innerText = step.a; cells[2].innerText = step.b; cells[3].innerText = step.c;
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
            cells[1].innerText = '?'; cells[2].innerText = '?'; cells[3].innerText = '?';
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
                a: 54, b: 54, c: 54,
                activeRow: "p2-row-step3",
                action: null
            },
            {
                desc: "③ 취소: C가 이기기 전으로 (C 승리 취소)",
                explanation: "💡 C는 승리하여 A와 B로부터 각각 '자신의 구슬만큼' 받았습니다.\n즉, 원래 구슬의 3배가 되어 54개가 된 것입니다.\nC의 원래 구슬은 18개이고, A와 B에게 각각 18개씩 돌려줍니다.",
                a: 72, b: 72, c: 18,
                activeRow: "p2-row-step2",
                action: { from: 'C', to: ['A', 'B'], amount: 18 }
            },
            {
                desc: "② 취소: B가 이기기 전으로 (B 승리 취소)",
                explanation: "💡 B는 승리하여 A와 C로부터 각각 '자신의 구슬만큼' 받아 72개가 되었습니다.\nB의 원래 구슬은 72 / 3 = 24개이고, A와 C에게 각각 24개씩 돌려줍니다.",
                a: 96, b: 24, c: 42,
                activeRow: "p2-row-step1",
                action: { from: 'B', to: ['A', 'C'], amount: 24 }
            },
            {
                desc: "① 취소: A가 이기기 전으로 (처음 상태)",
                explanation: "💡 A는 승리하여 B와 C로부터 각각 '자신의 구슬만큼' 받아 96개가 되었습니다.\nA의 원래 구슬은 96 / 3 = 32개이고, B와 C에게 각각 32개씩 돌려줍니다.\n\n🎉 정답: A=32, B=56, C=74!",
                a: 32, b: 56, c: 74,
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
        document.querySelector('#p2-person-A .count').innerText = step.a;
        document.querySelector('#p2-person-B .count').innerText = step.b;
        document.querySelector('#p2-person-C .count').innerText = step.c;
        renderMarbles(document.getElementById('p2-box-A'), step.a);
        renderMarbles(document.getElementById('p2-box-B'), step.b);
        renderMarbles(document.getElementById('p2-box-C'), step.c);
        document.getElementById('p2-step-info').innerText = step.desc;
        document.getElementById('p2-explanation-box').innerText = step.explanation;
        document.querySelectorAll('#p2-table tr').forEach(tr => tr.classList.remove('active-row'));
        document.getElementById(step.activeRow).classList.add('active-row');
        const row = document.getElementById(step.activeRow);
        const cells = row.querySelectorAll('td');
        cells[1].innerText = step.a; cells[2].innerText = step.b; cells[3].innerText = step.c;
        document.getElementById('p2-prev-btn').disabled = (this.currentStep === this.steps.length - 1);
    }

    nextStep() {
        if(this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            const action = this.steps[this.currentStep].action;
            if(action) {
                // 문제 2는 한 명이 두 명에게 동시에 돌려주는 경우가 있음
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
            cells[1].innerText = '?'; cells[2].innerText = '?'; cells[3].innerText = '?';
        });
        this.updateUI();
    }
}

// 앱 실행
window.onload = () => {
    new Problem1();
    new Problem2();
};
