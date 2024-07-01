document.addEventListener('DOMContentLoaded', (event) => {
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const strikeBtn = document.getElementById('strikeBtn');
    const bulletBtn = document.getElementById('bulletBtn');
    const numberBtn = document.getElementById('numberBtn');
    const headingBtn = document.getElementById('headingBtn');
    const subheadingBtn = document.getElementById('subheadingBtn');
    const bodyBtn = document.getElementById('bodyBtn');
    const checklistBtn = document.getElementById('checklistBtn');
    const editor = document.getElementById('editor');
    const contextMenu = document.getElementById('contextMenu');
    const contextItems = contextMenu.querySelectorAll('li');

    let currentIndex = -1;
    let menuVisible = false;

    const buttons = [
        { button: boldBtn, command: 'bold' },
        { button: italicBtn, command: 'italic' },
        { button: strikeBtn, command: 'strikeThrough' },
        { button: bulletBtn, command: 'insertUnorderedList' },
        { button: numberBtn, command: 'insertOrderedList' },
        { button: headingBtn, command: 'formatBlock', value: 'h1' },
        { button: subheadingBtn, command: 'formatBlock', value: 'h2' },
        { button: bodyBtn, command: 'formatBlock', value: 'p' },
        { button: checklistBtn, command: 'insertChecklist' },
    ];

    buttons.forEach(({ button, command, value }) => {
        button.addEventListener('click', () => {
            if (command === 'insertChecklist') {
                insertChecklist();
            } else if (value) {
                document.execCommand(command, false, value);
                if (command === 'formatBlock' && value === 'h1') {
                    document.execCommand('fontSize', false, '7'); // Heading
                } else if (command === 'formatBlock' && value === 'h2') {
                    document.execCommand('fontSize', false, '5'); // Subheading
                } else if (command === 'formatBlock' && value === 'p') {
                    document.execCommand('fontSize', false, '3'); // Body
                }
            } else {
                document.execCommand(command);
            }
            editor.focus();
            updateButtonStates();
        });
    });

    editor.addEventListener('input', updateButtonStates);
    editor.addEventListener('click', updateButtonStates);
    editor.addEventListener('keyup', updateButtonStates);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            document.execCommand('bold');
            editor.focus();
            updateButtonStates();
        } else if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            document.execCommand('italic');
            editor.focus();
            updateButtonStates();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'X') {
            e.preventDefault();
            document.execCommand('strikeThrough');
            editor.focus();
            updateButtonStates();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            document.execCommand('insertUnorderedList');
            editor.focus();
            updateButtonStates();
        } else if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            document.execCommand('insertOrderedList');
            editor.focus();
            updateButtonStates();
        } else if (e.key === '/') {
            showContextMenu(e);
        } else if (e.key === 'Enter' && isCheckboxItem()) {
            e.preventDefault();
            insertChecklist();
        } else if (e.key === 'Escape') {
            closeContextMenu();
        } else if (menuVisible) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateContextMenu(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateContextMenu(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentIndex > -1) {
                    contextItems[currentIndex].click();
                }
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target) && e.target !== editor) {
            closeContextMenu();
        }
    });

    function updateButtonStates() {
        buttons.forEach(({ button, command, value }) => {
            let isActive = false;
            if (command === 'formatBlock') {
                isActive = document.queryCommandValue('formatBlock').toLowerCase() === value.toLowerCase();
            } else {
                isActive = document.queryCommandState(command);
            }
            button.classList.toggle('active', isActive);
        });
    }

    function showContextMenu(e) {
        e.preventDefault();
        const rect = editor.getBoundingClientRect();
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (!range) {
            return;
        }

        const rangeRect = range.getBoundingClientRect();
        const menuX = Math.max(0, rangeRect.left - rect.left);
        const menuY = Math.max(0, rangeRect.bottom - rect.top);

        setMenuPosition({
            x: menuX,
            y: menuY,
        });
        menuVisible = true;
        currentIndex = -1;
    }

    function setMenuPosition(position) {
        contextMenu.style.left = `${position.x}px`;
        contextMenu.style.top = `${position.y}px`;
        contextMenu.classList.remove('hidden');
        contextMenu.style.display = 'block';
    }

    function closeContextMenu() {
        contextMenu.style.display = 'none';
        contextMenu.classList.add('hidden');
        menuVisible = false;
        currentIndex = -1;
    }

    function navigateContextMenu(direction) {
        currentIndex = (currentIndex + direction + contextItems.length) % contextItems.length;
        highlightContextItem();
    }

    function highlightContextItem() {
        contextItems.forEach((item, index) => {
            item.classList.toggle('highlighted', index === currentIndex);
        });
    }

    contextItems.forEach((item) => {
        item.onclick = () => {
            const command = item.getAttribute('data-command');
            const value = item.getAttribute('data-value');
            if (command === 'insertChecklist') {
                insertChecklist();
            } else if (value) {
                document.execCommand(command, false, value);
                if (command === 'formatBlock' && value === 'h1') {
                    document.execCommand('fontSize', false, '7'); // Heading
                } else if (command === 'formatBlock' && value === 'h2') {
                    document.execCommand('fontSize', false, '5'); // Subheading
                } else if (command === 'formatBlock' && value === 'p') {
                    document.execCommand('fontSize', false, '3'); // Body
                }
            } else {
                document.execCommand(command);
            }
            editor.focus();
            closeContextMenu();
        };
    });

    function insertChecklist() {
        const range = window.getSelection().getRangeAt(0);
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '10px';

        const span = document.createElement('span');
        span.appendChild(checkbox);
        span.appendChild(document.createTextNode(' '));
        span.contentEditable = true;

        range.insertNode(span);
        range.collapse(false);
        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.setEndAfter(span);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    function isCheckboxItem() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            return false;
        }

        const container = selection.getRangeAt(0).startContainer;
        return container.nodeType === Node.ELEMENT_NODE && container.querySelector('input[type="checkbox"]') !== null;
    }
});
