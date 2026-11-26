document.getElementById('registerBtn').addEventListener('click', async function () {
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const suffix = document.getElementById('suffix').value.trim();
    const birthDate = document.getElementById('birthDate').value.trim();
    const gender = document.getElementById('gender').value;
    const disabilityType = document.getElementById('disabilityType').value;
    const address = document.getElementById('address').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();

    if (!lastName || !firstName || !birthDate || !gender || !disabilityType || !address || !contactNumber) {
        document.getElementById('classificationResult').innerHTML = '<p class="error">Please complete all fields before registering.</p>';
        return;
    }

    const birthDateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
    if (!birthDateParts) {
        document.getElementById('classificationResult').innerHTML = '<p class="error">Enter the birth date in YYYY-MM-DD format.</p>';
        return;
    }

    const birthYear = Number(birthDateParts[1]);
    const birthMonth = Number(birthDateParts[2]);
    const birthDay = Number(birthDateParts[3]);
    const dob = new Date(0);
    dob.setHours(0, 0, 0, 0);
    dob.setFullYear(birthYear, birthMonth - 1, birthDay);
    if (dob.getFullYear() !== birthYear || dob.getMonth() !== birthMonth - 1 || dob.getDate() !== birthDay) {
        document.getElementById('classificationResult').innerHTML = '<p class="error">Enter a valid birth date.</p>';
        return;
    }

    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');
    const escapeHtml = (value) => value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, "&#039;");

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }

    let ageGroup = 'Adult';
    if (age <= 12) ageGroup = 'Child';
    else if (age <= 17) ageGroup = 'Teen';
    else if (age <= 59) ageGroup = 'Adult';
    else ageGroup = 'Senior';

    const disabilityCategory = disabilityType.includes('Visual') || disabilityType.includes('Hearing') ? 'Sensory Disability' :
        disabilityType.includes('Physical') || disabilityType.includes('Multiple') ? 'Physical/Mobility Disability' :
        disabilityType.includes('Intellectual') || disabilityType.includes('Mental') ? 'Cognitive/Mental Disability' : 'Other Disability';

    const { error } = await db
        .from('pwd_members')
        .insert([{
            last_name: lastName,
            first_name: firstName,
            middle_name: middleName,
            suffix: suffix,
            birth_date: birthDate,
            age: age,
            age_group: ageGroup,
            gender: gender,
            disability_type: disabilityType,
            disability_category: disabilityCategory,
            address: address,
            contact_number: contactNumber
        }]);

    if (error) {
        document.getElementById('classificationResult').innerHTML = `<p class="error">Database Error: ${escapeHtml(error.message)}</p>`;
        return;
    }

    document.getElementById('classificationResult').innerHTML = `
        <h3>Registration Saved to Database!</h3>
        <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Age / Group:</strong> ${age} (${ageGroup})</p>
        <p><strong>Gender:</strong> ${escapeHtml(gender)}</p>
        <p><strong>Disability:</strong> ${escapeHtml(disabilityType)} (${disabilityCategory})</p>
        <p><strong>Address:</strong> ${escapeHtml(address)}</p>
        <p><strong>Contact:</strong> ${escapeHtml(contactNumber)}</p>
    `;
    document.getElementById('memberForm').reset();
});
