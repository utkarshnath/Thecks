/**
 * Created by sparsh on 13/8/16.
 */

$(function () {
    $("#create_group").click(function () {
        vex.dialog.open({
            message: 'Enter the Group Name and Password:',
            input: [
                '<input name="groupName" type="text" placeholder="Group Name" required />',
                '<input name="groupPassword" type="password" placeholder="Password" required />'
            ].join(''),
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {text: 'Create Group'}),
                $.extend({}, vex.dialog.buttons.NO, {text: 'Back'})
            ],
            callback: function (data) {
                if (!data) {
                    console.log('Cancelled')
                } else {
                    $.post('/create', {
                        groupName: data.groupName,
                        groupPassword: data.groupPassword
                    }).done(function (data) {
                        console.log(data);
                        window.location.href = data.redirect;
                    });
                }
            }
        });
    });

    $("#join_group").click(function () {
        vex.dialog.open({
            message: 'Enter the Group Name and Password:',
            input: [
                '<input name="groupName" type="text" placeholder="Group Name" required />',
                '<input name="groupPassword" type="password" placeholder="Password" required />'
            ].join(''),
            buttons: [
                $.extend({}, vex.dialog.buttons.YES, {text: 'Join Group'}),
                $.extend({}, vex.dialog.buttons.NO, {text: 'Back'})
            ],
            callback: function (data) {
                if (!data) {
                    console.log('Cancelled')
                } else {
                    $.post('/join', {
                        groupName: data.groupName,
                        groupPassword: data.groupPassword
                    }).done(function (data) {
                        console.log(data);
                        window.location.href = data.redirect;
                    });
                }
            }
        });
    });

    $(".list-item").click(function () {
        // Make a get request for the group page
        $.get('/group', {groupId: $(this).attr("data-groupId")}, function (data) {
            console.log(data);
            console.log(data.redirect);
            window.location.href = data.redirect;
        });
    });
});
