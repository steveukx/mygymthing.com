define([
    'util/dom',
    'widgets/dialog',
    'text!fragments/create-workout-dialog.html'
], /** @exports workouts */ function (
    dom,
    dialog,
    template
) {

    dom('[data-action="start"]').on('click', function (e) {
        var workouts = {};
        dialog(workouts)
            .showModal('Create Workout', template)
            .on('close', function (e) {
                console.log('closed: ', workouts);
            });
    });

});
