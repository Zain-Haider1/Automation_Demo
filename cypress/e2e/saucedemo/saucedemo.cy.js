
describe('saucedemo',()=>{
    beforeEach(()=>{
        cy.saucedemo()
    })

    it('View the product detail',()=>{
        cy.get('#inventory_container').find('div.inventory_list').find('div.inventory_item').find('div.inventory_item_description')
        .find('div.inventory_item_label').find('a#item_4_title_link').find('div.inventory_item_name')
        .should('have.text','Sauce Labs Backpack').then(()=>{
            cy.get('.pricebar').find('div.inventory_item_price').first().should('have.text','$29.99')
            cy.get('#item_4_title_link').click()
        })

    })

    it('Add to Cart',()=>{
        cy.get('#inventory_container').find('div.inventory_list').find('div.inventory_item').find('div.inventory_item_description')
        .find('div.inventory_item_label').find('a#item_4_title_link').find('div.inventory_item_name')
        .should('have.text','Sauce Labs Backpack').then(()=>{
            cy.get('.pricebar').find('div.inventory_item_price').first().should('have.text','$29.99')
            cy.get('button#add-to-cart-sauce-labs-backpack').click()
        })
    })

    it.only('Remove item from the cart',()=>{
        cy.get('#inventory_container').find('div.inventory_list').find('div.inventory_item').find('div.inventory_item_description')
        .find('div.inventory_item_label').find('a#item_4_title_link').find('div.inventory_item_name')
        .should('have.text','Sauce Labs Backpack').then(()=>{
            cy.get('.pricebar').find('div.inventory_item_price').first().should('have.text','$29.99')
            cy.get('button#add-to-cart-sauce-labs-backpack').click()
        })
        cy.get('#shopping_cart_container').find('a.shopping_cart_link').click()
        cy.get('.header_secondary_container').find('span.title').should('have.text','Your Cart').then(()=>{
            cy.get('#cart_contents_container').find('div.cart_list').find('div.cart_item').find('div.cart_item_label')
            .find('div.item_pricebar').find('#remove-sauce-labs-backpack').should('have.text','Remove').click()
            cy.get('.cart_footer').find('button#continue-shopping').should('have.text','Continue Shopping').click()
        })
    })
})