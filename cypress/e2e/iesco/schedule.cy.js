

describe('Check the Monthly maintenance schedule',()=>{

    it('Navigate to maintenance schedule',()=>{
        cy.visit('https://iesco.com.pk/')

        cy.get('.maximenuCKH.header_menu').find('div.maxiRoundedcenter').find('li.maximenuCK.item103.parent.level0').find('a.maximenuCK')
        .contains('Customer Services').click().then(()=>{
            cy.get('.maximenuCK2.first').find('ul.maximenuCK2').find('li.maximenuCK.item123.level1')
            .find('a.maximenuCK').contains('Maintenance Schedule').click()

            cy.get('.item-page').find('div.body').find('div.body_left_bodprofile').find('h3#body_aboutus_h3')
            .should('have.text','Shutdown Schedule').then(()=>{
                cy.get('tbody.tr.table_odd_row')
            })

        })
    })

})
