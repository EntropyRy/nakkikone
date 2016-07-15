class Party < ActiveRecord::Base
#  attr_accessible :title, :description, :date, :info_date, :aux_jobs_enabled
  def create
     Party.create(party_params)
  end
  has_many :aux_nakkis, :dependent => :delete_all
  has_many :nakkitypes, :dependent => :delete_all
  
  validates :title, :presence => true, :uniqueness => true, :length => {
    :minimum => 3,
    :maximum => 50,
    :too_short => "#{count} character is minimum allowed", ##TODO fix count to real value
    :too_long => "#{count} character is maximum allowed" ##TODO fix count to real value
  }
  validates :description, :presence => true, :length => {
    :minimum => 3,
    :maximum => 1000,
    :too_short => "#{count} character is minimum allowed", ##TODO fix count to real value
    :too_long => "#{count} character is maximum allowed" ##TODO fix count to real value
  }
  validates :date, :presence => true
  validates :info_date, :presence => true

  class PartyTimeValidator < ActiveModel::Validator #TODO move to own file...
    def validate(record)
      if record.date.past?
        record.errors[:date] << "Party Date must be in future"
      end
    end
  end

  validates_with Party::PartyTimeValidator
  private
    def party_params
      params.require(:party).permit(:title, :description, :date, :info_date, :aux_jobs_enabled)
    end
end
