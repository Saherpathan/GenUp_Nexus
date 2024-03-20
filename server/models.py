from marshmallow import Schema, fields

class UserSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)
    resume = fields.Str()  
    dp = fields.Str()  

class DashboardSchema(Schema):
    uniq_path_id = fields.Str(required=True)
    name = fields.Str(required=True)
    current_role = fields.Str()
    desired_company = fields.Str()
    learning_path_progress = fields.Dict()
    recent_mindmaps = fields.Dict()
    recent_interviews = fields.Dict()

class LearningPathSchema(Schema):
    uniq_path_id = fields.Str(required=True)
    data = fields.Dict() 
    total_path_tuples = fields.Int()
    current_progress_tuples = fields.Int()

class MindmapSchema(Schema):
    uniq_map_id = fields.Str(required=True)
    data = fields.Dict()  

class InterviewSchema(Schema):
    uniq_interview_id = fields.Str(required=True)
    data = fields.Dict()


