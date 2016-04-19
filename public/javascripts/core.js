function reject(id) {
    $.ajax({
        url: '/admin/' + id,
        type: 'DELETE',
        success: function(result) {
            location.reload();
        }
    });
}

function accept(id, name, tribute) {
    //remove it from the pending collection
    reject(id);

    //add it to the tribute collection
    $.ajax({
        url: '/admin/' + name + '/' + tribute ,
        type: 'POST',
        success: function(result) {
        }
    });
}
