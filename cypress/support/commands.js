

Cypress.Commands.add('saucedemo',()=>{

    cy.visit('https://www.saucedemo.com/').then(()=>{
        cy.viewport('macbook-16')
        cy.get('.login_container').find('div.login_logo').should('have.text','Swag Labs').then(()=>{
            cy.get('.login_wrapper').find('div.login_wrapper-inner').find('div#login_button_container').find('div.login-box')
            .find('div.form_group').find('input.input_error.form_input').first().type('standard_user')
            cy.get('#password').type('secret_sauce')
            cy.get('#login-button').click()
        })
            
    })
    
})