const searchInput = document.getElementById('memberSearch');
const memberTableBody = document.getElementById('memberTableBody');
const memberCount = document.getElementById('memberCount');
const tableFooter = document.getElementById('tableFooter');

let allMembers = [];

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, "'");
}

function formatFullName(member) {
    const cleanMiddle = member.middle_name && member.middle_name.toUpperCase() !== 'N/A' ? member.middle_name : '';
    const cleanSuffix = member.suffix && member.suffix.toUpperCase() !== 'N/A' ? member.suffix : '';
    const afterLastName = [member.first_name, cleanSuffix, cleanMiddle].filter(Boolean).join(' ');
    return `${member.last_name}, ${afterLastName}`;
}

function updateFooterDate() {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    tableFooter.textContent = `Date: ${today}`;
}

async function fetchMembers() {
    memberCount.textContent = 'Loading members from database...';

    const { data, error } = await db
        .from('pwd_members')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        memberTableBody.innerHTML = '';
        memberCount.textContent = 'Database Error: ' + error.message;
        return;
    }

    allMembers = data.map(member => ({
        ...member,
        fullName: formatFullName(member)
    }));

    renderMembers();
}

function renderMembers() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    const matches = allMembers.filter(member =>
        member.fullName.toLocaleLowerCase().includes(query) ||
        (member.disability_type || '').toLocaleLowerCase().includes(query) ||
        (member.address || '').toLocaleLowerCase().includes(query)
    );

    memberTableBody.innerHTML = '';
    memberCount.textContent = allMembers.length
        ? `Showing ${matches.length} of ${allMembers.length} registered member${allMembers.length === 1 ? '' : 's'}`
        : 'No members registered yet.';

    matches.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(member.fullName)}</strong></td>
            <td>${escapeHtml(member.birth_date)}</td>
            <td>${escapeHtml(member.age)}</td>
            <td>${escapeHtml(member.age_group)}</td>
            <td>${escapeHtml(member.gender)}</td>
            <td>${escapeHtml(member.disability_type)}</td>
            <td>${escapeHtml(member.disability_category || 'N/A')}</td>
            <td>${escapeHtml(member.address)}</td>
            <td>${escapeHtml(member.contact_number)}</td>
        `;
        memberTableBody.appendChild(row);
    });

    if (allMembers.length && matches.length === 0) {
        memberCount.textContent = 'No members match your search.';
    }
}

searchInput.addEventListener('input', renderMembers);
updateFooterDate();
fetchMembers();
