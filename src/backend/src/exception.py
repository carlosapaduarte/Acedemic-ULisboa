class NotFoundException(Exception):
    def __init__(self, user_id: int):
        super().__init__(user_id)
        self.user_id = user_id

class NotAvailableScheduleBlockCollision(Exception):
    def __init__(self):
        super().__init__()