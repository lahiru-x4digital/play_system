import api from "./api"
const baseUrl = '/smtp-config'

export const smtpService = {
    getAllSmtpConfigs,
    getSmtpConfigById,
    createSmtpConfig,
    updateSmtpConfig,
    deleteSmtpConfig,
    testSmtpConnection
}

async function getAllSmtpConfigs(page = 1, perPage = 10, searchParams = {}) {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
            ...searchParams
        }).toString()

        const response = await api.get(`${baseUrl}?${queryParams}`)
        return {
            data: {
                smtpConfigs: response.data.data || []
            },
            pagination: {
                total: response.data.total || 0,
                pages: response.data.pages || 1,
                current_page: response.data.page || page,
                per_page: perPage
            }
        }
    } catch (error) {
        console.error('Fetch SMTP configs error:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch SMTP configurations')
    }
}

async function getSmtpConfigById(id) {
    try {
        const response = await api.get(`${baseUrl}?id=${id}`)
        return response.data
    } catch (error) {
        console.error('Get SMTP config error:', error)
        throw new Error(error.response?.data?.message || 'Failed to fetch SMTP configuration')
    }
}

async function createSmtpConfig(data) {
    try {
        const response = await api.post(baseUrl, data)
        return response.data
    } catch (error) {
        console.error('Create SMTP config error:', error)
        throw new Error(error.response?.data?.message || 'Failed to create SMTP configuration')
    }
}

async function updateSmtpConfig(id, data) {
    try {
        const response = await api.put(`${baseUrl}?id=${id}`, data)
        return response.data
    } catch (error) {
        console.error('Update SMTP config error:', error)
        throw new Error(error.response?.data?.message || 'Failed to update SMTP configuration')
    }
}

async function deleteSmtpConfig(id) {
    try {
        const response = await api.delete(`${baseUrl}?id=${id}`)
        return response.data
    } catch (error) {
        console.error('Delete SMTP config error:', error)
        throw new Error(error.response?.data?.message || 'Failed to delete SMTP configuration')
    }
}

async function testSmtpConnection(data) {
    try {
        const response = await api.post(`${baseUrl}/test`, data)
        return response.data
    } catch (error) {
        console.error('Test SMTP connection error:', error)
        throw new Error(error.response?.data?.message || 'Failed to test SMTP connection')
    }
}


// const transporte = nodeMailer.createTransport({
//     host: 'mxslurp.click',
//     port: 2525,
//     secure: false,
//     auth: {
//         user: 'test-070f5075-0a96-445d-8050-14440ccebaeb@mailslurp.biz',
//         pass: 'Igdzvk1LHFWJm5LxeF2Q4AeV8NJbMhWT'
//     }
// })
// const sendTestEmail = async () => {
//     const subject = 'Test Email'
//     const body = 'This is a test email'
//     const to = 'julach@x4digital.io'
//     const from = 'test-070f5075-0a96-445d-8050-14440ccebaeb@mailslurp.biz'

//     transporte.sendMail({
//         from,
//         to,
//         subject,
//         text: body
//     }).then(() => {
//         console.log('Email sent successfully')
//     }).catch(() => {
//         console.log('Email sent failed')
//     });
// }

// sendTestEmail()


