class Nakkitype < ActiveRecord::Base
  #attr_accessible :nakkitype_info_id, :name ##FIXME remove name attribute from persistent store
  def create
     Nakkitype.create(nakkitype_params)
  end

  belongs_to :party
  has_many :nakkis, :dependent => :delete_all
  belongs_to :nakkitype_info

  validates :party_id, :presence => true
  validates :nakkitype_info_id, :presence => true
  private
    def nakkitype_params
      params.require(:nakkitype).permit(:nakkitype_info_id, :name)
    end

end
