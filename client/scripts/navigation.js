Template.Navigation.onRendered(function () {
	$('.dropdown-toggle').dropdown();

	$('ul.dropdown-menu [data-toggle=dropdown]').click(function(event) {
    //avoid following the href location when clicking
    event.preventDefault(); 

    //avoid having the menu close when clicking
    event.stopPropagation(); 

    //re-add .open to parent sub-menu item
    $(this).parent().addClass('open');
    $(this).parents('li.dropdown').addClass('open');
	});
});